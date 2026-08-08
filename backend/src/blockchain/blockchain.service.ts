import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

export interface AnchorResult {
  transactionHash: string | null;
  blockNumber: number | null;
}

// Minimal ABI — only the functions the backend calls
const LEDGER_ABI = [
  'function recordAttendance(string attendanceId, string sessionId, bytes32 attendanceHash) external',
  'function verifyAttendance(string attendanceId, bytes32 hashToCheck) external view returns (bool matches, bool exists)',
  'function getAttendanceProof(string attendanceId) external view returns (string, string, bytes32, uint256)',
  'event AttendanceRecorded(string indexed attendanceId, string indexed sessionId, bytes32 attendanceHash, uint256 timestamp)',
  'error NotOwner()',
  'error AlreadyRecorded(string attendanceId)'
];

/**
 * Canonical hash format (must match verification logic exactly):
 * SHA-256 of: "${attendanceId}|${sessionId}|${studentId}|${markedAt.toISOString()}|${distance ?? 'null'}"
 */
export function buildAttendanceHash(
  attendanceId: string,
  sessionId: string,
  studentId: string,
  markedAt: Date,
  distance: number | null,
): string {
  const distStr = distance === null || distance === undefined ? 'null' : String(distance);
  const canonical = `${attendanceId}|${sessionId}|${studentId}|${markedAt.toISOString()}|${distStr}`;
  return '0x' + crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

interface QueueItem {
  attendanceId: string;
  sessionId: string;
  studentId: string;
  markedAt: Date;
  distance: number | null;
  resolve: (result: AnchorResult) => void;
  reject: (err: unknown) => void;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);

  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  // Serialized transaction queue — prevents nonce collisions under concurrent load
  private queue: QueueItem[] = [];
  private processing = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.getOrThrow<string>('SEPOLIA_RPC_URL');
    const privateKey = this.config.getOrThrow<string>('BLOCKCHAIN_WALLET_PRIVATE_KEY');
    const contractAddress = this.config.getOrThrow<string>('CONTRACT_ADDRESS');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, LEDGER_ABI, this.wallet);

    this.logger.log(`BlockchainService initialized. Wallet: ${this.wallet.address}`);
  }

  /**
   * Enqueue an attendance record for async anchoring.
   * Returns a promise that resolves with the tx result once the transaction confirms.
   */
  enqueueAnchor(
    attendanceId: string,
    sessionId: string,
    studentId: string,
    markedAt: Date,
    distance: number | null,
  ): Promise<AnchorResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ attendanceId, sessionId, studentId, markedAt, distance, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      try {
        const result = await this.sendTransaction(item);
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }

    this.processing = false;
  }

  private async sendTransaction(item: QueueItem): Promise<AnchorResult> {
    const hash = buildAttendanceHash(
      item.attendanceId,
      item.sessionId,
      item.studentId,
      item.markedAt,
      item.distance,
    );

    try {
      const tx = await this.contract.recordAttendance(
        item.attendanceId,
        item.sessionId,
        hash as `0x${string}`,
      );

      const receipt = await tx.wait(1); // wait for 1 confirmation

      this.logger.log(
        `Anchored attendance ${item.attendanceId} | tx: ${receipt.hash} | block: ${receipt.blockNumber}`,
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (err: any) {
      // Detect AlreadyRecorded custom error via multiple methods:
      // 1. Ethers decoded revert (works when ethers can parse the ABI error)
      // 2. Error reason string (fallback for some ethers versions)
      // 3. Raw error data selector 0x5c7b4c30 (keccak256("AlreadyRecorded(string)") first 4 bytes)
      //    This is needed because ethers v6 returns revert=null during estimateGas failures
      const isAlreadyRecorded =
        err.revert?.name === 'AlreadyRecorded' ||
        err.reason?.includes('AlreadyRecorded') ||
        err.data?.startsWith?.('0x5c7b4c30') ||
        (typeof err.message === 'string' && err.message.includes('0x5c7b4c30'));

      if (isAlreadyRecorded) {
        const verification = await this.verifyRecord(
          item.attendanceId,
          item.sessionId,
          item.studentId,
          item.markedAt,
          item.distance,
        );

        if (verification.hashMatch) {
          this.logger.warn(`Attendance ${item.attendanceId} already recorded and matches. Marking as confirmed.`);
          return {
            transactionHash: null,
            blockNumber: null,
          };
        } else {
          this.logger.error(`Attendance ${item.attendanceId} already recorded BUT HASH MISMATCH. Tampering detected.`);
          throw new Error('AlreadyRecorded with hash mismatch');
        }
      }
      throw err;
    }
  }

  /**
   * Verify a record: recompute the hash from Postgres data and compare to on-chain.
   * Returns: { onChain: boolean, hashMatch: boolean, attendanceHash: string }
   */
  async verifyRecord(
    attendanceId: string,
    sessionId: string,
    studentId: string,
    markedAt: Date,
    distance: number | null,
  ): Promise<{ onChain: boolean; hashMatch: boolean; attendanceHash: string }> {
    const recomputedHash = buildAttendanceHash(
      attendanceId,
      sessionId,
      studentId,
      markedAt,
      distance,
    );

    const [matches, exists]: [boolean, boolean] = await this.contract.verifyAttendance(
      attendanceId,
      recomputedHash,
    );

    return {
      onChain: exists,
      hashMatch: matches,
      attendanceHash: recomputedHash,
    };
  }

  async getStatus() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      const contractAddress = await this.contract.getAddress();
      return {
        connected: true,
        blockNumber,
        networkName: network.name === 'unknown' ? 'sepolia' : network.name,
        chainId: Number(network.chainId),
        walletAddress: this.wallet.address,
        balance: ethers.formatEther(balance),
        contractAddress,
      };
    } catch (err: any) {
      return {
        connected: false,
        error: err.message || 'Failed to connect to blockchain node',
      };
    }
  }
}

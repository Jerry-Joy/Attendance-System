import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from './blockchain.service';
import { BlockchainStatus } from '@prisma/client';

@Injectable()
export class BlockchainScheduler {
  private readonly logger = new Logger(BlockchainScheduler.name);

  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  /** Every 2 minutes: retry attendance records stuck in PENDING or FAILED */
  @Cron('*/2 * * * *')
  async retryPendingAndFailed() {
    const records = await this.prisma.attendance.findMany({
      where: {
        blockchainStatus: { in: [BlockchainStatus.PENDING, BlockchainStatus.FAILED] },
      },
      select: {
        id: true,
        sessionId: true,
        studentId: true,
        markedAt: true,
        distance: true,
      },
      take: 20, // process at most 20 per run to avoid overwhelming the queue
    });

    if (records.length === 0) return;

    this.logger.log(`Retrying ${records.length} blockchain-pending attendance record(s)`);

    for (const record of records) {
      // Fire-and-forget per record; errors are caught individually
      this.blockchain
        .enqueueAnchor(
          record.id,
          record.sessionId,
          record.studentId,
          record.markedAt,
          record.distance,
        )
        .then(async ({ transactionHash, blockNumber }) => {
          await this.prisma.attendance.update({
            where: { id: record.id },
            data: {
              transactionHash,
              blockNumber,
              blockchainStatus: BlockchainStatus.CONFIRMED,
            },
          });
          this.logger.log(`Retry confirmed for attendance ${record.id}`);
        })
        .catch(async (err) => {
          this.logger.error(`Retry failed for attendance ${record.id}: ${err?.message}`);
          await this.prisma.attendance.update({
            where: { id: record.id },
            data: { blockchainStatus: BlockchainStatus.FAILED },
          });
        });
    }
  }
}

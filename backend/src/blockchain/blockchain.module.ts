import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainScheduler } from './blockchain.scheduler';

@Module({
  providers: [BlockchainService, BlockchainScheduler],
  exports: [BlockchainService],
})
export class BlockchainModule {}

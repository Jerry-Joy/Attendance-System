import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { EventsModule } from '../events/events.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [EventsModule, BlockchainModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule { }

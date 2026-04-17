import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsScheduler } from './sessions.scheduler';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsScheduler],
  exports: [SessionsService],
})
export class SessionsModule { }

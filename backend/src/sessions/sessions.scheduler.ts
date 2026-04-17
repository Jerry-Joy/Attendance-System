import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionsScheduler {
    private readonly logger = new Logger(SessionsScheduler.name);

    constructor(private readonly sessions: SessionsService) { }

    /** Runs every minute to auto-end sessions whose duration has elapsed */
    @Cron(CronExpression.EVERY_MINUTE)
    async expireStale() {
        try {
            await this.sessions.expireStale();
        } catch (err) {
            this.logger.error('Failed to expire stale sessions', err);
        }
    }
}

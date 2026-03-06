import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SessionsController {
  constructor(private sessionsService: SessionsService) { }

  @Roles(Role.LECTURER)
  @Post('sessions')
  create(@CurrentUser() user: any, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.id, dto);
  }

  @Get('sessions/:id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Roles(Role.LECTURER)
  @Patch('sessions/:id/end')
  endSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.endSession(id, user.id);
  }

  @Roles(Role.LECTURER)
  @Patch('sessions/:id/refresh-qr')
  refreshQr(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.refreshQr(id, user.id);
  }

  @Roles(Role.LECTURER)
  @Get('courses/:id/sessions')
  findByCourse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.findByCourse(id, user.id);
  }

  @Roles(Role.LECTURER)
  @Get('sessions/:id/summary')
  getSummary(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.getSummary(id, user.id);
  }
}

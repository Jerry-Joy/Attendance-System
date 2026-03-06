import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) { }

  @Roles(Role.STUDENT)
  @Post('attendance/mark')
  mark(@CurrentUser() user: any, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.mark(user.id, dto);
  }

  @Roles(Role.STUDENT)
  @Get('attendance/history')
  history(@CurrentUser() user: any) {
    return this.attendanceService.getHistory(user.id);
  }

  @Roles(Role.LECTURER)
  @Get('sessions/:id/attendance')
  sessionAttendance(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attendanceService.getSessionAttendance(id, user.id);
  }
}

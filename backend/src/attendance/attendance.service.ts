import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { SessionStatus, VerificationMethod } from '@prisma/client';
import { haversineDistance } from './utils/haversine';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) { }

  async mark(studentId: string, dto: MarkAttendanceDto) {
    // 1. Find active session by QR token
    const session = await this.prisma.session.findFirst({
      where: {
        courseId: dto.courseId,
        status: SessionStatus.ACTIVE,
      },
    });
    if (!session) throw new NotFoundException('No active session for this course');

    // Check auto-end by duration
    const endTime = new Date(
      session.startedAt.getTime() + session.duration * 60_000,
    );
    if (new Date() > endTime) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { status: SessionStatus.ENDED, endedAt: endTime },
      });
      throw new BadRequestException('Session has expired');
    }

    // 2. Validate QR token matches (accept current or previous token to
    //    handle the race condition where the QR refreshes while a student
    //    is completing GPS verification)
    const tokenValid =
      session.qrToken === dto.token ||
      (session.previousQrToken != null && session.previousQrToken === dto.token);
    if (!tokenValid)
      throw new BadRequestException('Invalid or expired QR token');

    // 3. Check student is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId: dto.courseId },
      },
    });
    if (!enrollment)
      throw new ForbiddenException('You are not enrolled in this course');

    // 4. No duplicate attendance
    const existing = await this.prisma.attendance.findUnique({
      where: {
        sessionId_studentId: { sessionId: session.id, studentId },
      },
    });
    if (existing)
      throw new ConflictException('Attendance already marked for this session');

    // 5. GPS verification — always required
    if (session.latitude == null || session.longitude == null) {
      throw new BadRequestException(
        'Session has no venue GPS coordinates. Ask your lecturer to restart the session with location enabled.',
      );
    }

    const distance = haversineDistance(
      session.latitude,
      session.longitude,
      dto.latitude,
      dto.longitude,
    );

    // Allow generous tolerance for indoor GPS drift (both devices combined)
    const effectiveRadius = session.geofenceRadius + 80;
    if (distance > effectiveRadius) {
      throw new BadRequestException(
        `You are ${Math.round(distance)}m from the venue. You need to be within ${session.geofenceRadius}m.`,
      );
    }

    const method = VerificationMethod.QR_GPS;

    // 6. Create attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        sessionId: session.id,
        studentId,
        method,
        distance: Math.round(distance * 100) / 100,
      },
      include: {
        student: {
          select: { id: true, fullName: true, studentId: true },
        },
      },
    });

    const result = {
      id: attendance.id,
      method: attendance.method,
      distance: attendance.distance,
      markedAt: attendance.markedAt,
      student: attendance.student,
      sessionId: session.id,
    };

    // Emit real-time event to the session room
    this.events.emitNewAttendance(session.id, result);

    return result;
  }

  async getHistory(studentId: string) {
    const records = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            course: {
              select: { courseCode: true, courseName: true },
            },
            lecturer: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { markedAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      courseCode: r.session.course.courseCode,
      courseName: r.session.course.courseName,
      lecturer: r.session.lecturer.fullName,
      date: r.session.startedAt,
      markedAt: r.markedAt,
      method: r.method,
      distance: r.distance,
    }));
  }

  async getSessionAttendance(sessionId: string, lecturerId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this session');

    return this.prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, studentId: true },
        },
      },
      orderBy: { markedAt: 'asc' },
    });
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Role, SessionStatus } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import * as crypto from 'crypto';

function generateQrToken(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = crypto.randomBytes(3).toString('hex'); // 6 hex chars
  return `SA-${timestamp}-${random}`;
}

const MAX_LECTURER_LOCATION_ACCURACY_M = 200; // Increased to 200m to support laptop/desktop WiFi-based location
const MAX_LECTURER_LOCATION_AGE_MS = 2 * 60 * 1000;
const MAX_LECTURER_LOCATION_FUTURE_SKEW_MS = 30 * 1000;

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) { }

  async create(lecturerId: string, dto: CreateSessionDto) {
    // Verify the lecturer owns this course
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this course');

    // Only one active session per course at a time
    const active = await this.prisma.session.findFirst({
      where: { courseId: dto.courseId, status: SessionStatus.ACTIVE },
    });
    if (active)
      throw new ConflictException(
        'An active session already exists for this course',
      );

    if (dto.latitude == null || dto.longitude == null) {
      throw new BadRequestException(
        'Venue location is required to start a GPS-verified session.',
      );
    }

    if (dto.lecturerAccuracy == null || !dto.lecturerLocationCapturedAt) {
      throw new BadRequestException(
        'Lecturer GPS accuracy and capture timestamp are required.',
      );
    }

    if (dto.lecturerAccuracy > MAX_LECTURER_LOCATION_ACCURACY_M) {
      throw new BadRequestException(
        `Lecturer GPS accuracy is too low (${Math.round(dto.lecturerAccuracy)}m). Move to a clearer area and recapture location.`,
      );
    }

    const capturedAt = new Date(dto.lecturerLocationCapturedAt);
    if (Number.isNaN(capturedAt.getTime())) {
      throw new BadRequestException('Invalid lecturer location capture timestamp.');
    }

    const ageMs = Date.now() - capturedAt.getTime();
    if (ageMs < -MAX_LECTURER_LOCATION_FUTURE_SKEW_MS) {
      throw new BadRequestException('Lecturer location timestamp is in the future. Recapture location.');
    }
    if (ageMs > MAX_LECTURER_LOCATION_AGE_MS) {
      throw new BadRequestException(
        'Lecturer location is stale. Recapture location right before starting the session.',
      );
    }

    const qrToken = generateQrToken();

    return this.prisma.session.create({
      data: {
        courseId: dto.courseId,
        lecturerId,
        qrToken,
        latitude: dto.latitude,
        longitude: dto.longitude,
        lecturerAccuracy: dto.lecturerAccuracy,
        lecturerLocationCapturedAt: capturedAt,
        geofenceRadius: dto.geofenceRadius ?? 50,
        duration: dto.duration,
      },
      include: {
        course: { select: { courseCode: true, courseName: true, venue: true } },
        _count: { select: { attendances: true } },
      },
    }).then((session) => {
      // Notify enrolled students via WebSocket
      this.events.emitSessionStarted(dto.courseId, {
        sessionId: session.id,
        courseCode: session.course.courseCode,
        courseName: session.course.courseName,
        venue: session.course.venue,
        duration: session.duration,
      });
      return session;
    });
  }

  async findOne(sessionId: string, userId: string, role: Role) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: { select: { courseCode: true, courseName: true, venue: true } },
        _count: { select: { attendances: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (role === Role.LECTURER && session.lecturerId !== userId) {
      throw new ForbiddenException('You do not own this session');
    }

    if (role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: session.courseId,
          },
        },
      });
      if (!enrollment)
        throw new ForbiddenException('You are not enrolled in this course');
    }

    // Auto-end if duration has expired
    if (session.status === SessionStatus.ACTIVE) {
      const endTime = new Date(
        session.startedAt.getTime() + session.duration * 60_000,
      );
      if (new Date() > endTime) {
        return this.prisma.session.update({
          where: { id: sessionId },
          data: { status: SessionStatus.ENDED, endedAt: endTime },
          include: {
            course: {
              select: { courseCode: true, courseName: true, venue: true },
            },
            _count: { select: { attendances: true } },
          },
        });
      }
    }

    return session;
  }

  async endSession(sessionId: string, lecturerId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this session');
    if (session.status === SessionStatus.ENDED)
      throw new ConflictException('Session already ended');

    const ended = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.ENDED, endedAt: new Date() },
      include: {
        course: { select: { courseCode: true, courseName: true, venue: true } },
        _count: { select: { attendances: true } },
      },
    });
    this.events.emitSessionEnded(sessionId);
    this.events.emitSessionEndedToCourse(ended.courseId, sessionId);
    return ended;
  }

  async refreshQr(sessionId: string, lecturerId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this session');
    if (session.status === SessionStatus.ENDED)
      throw new ConflictException('Session already ended');

    const newToken = generateQrToken();
    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        previousQrToken: session.qrToken,
        qrToken: newToken,
      },
      select: { id: true, qrToken: true },
    });
    this.events.emitQrRefreshed(sessionId, newToken);
    return updated;
  }

  async findByCourse(courseId: string, lecturerId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this course');

    return this.prisma.session.findMany({
      where: { courseId },
      include: {
        course: { select: { courseCode: true, courseName: true, venue: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSummary(sessionId: string, lecturerId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true,
            venue: true,
            _count: { select: { enrollments: true } },
          },
        },
        attendances: {
          select: { method: true, distance: true, markedAt: true },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this session');

    const totalStudents = session.course._count.enrollments;
    const presentCount = session.attendances.length;
    const qrGpsVerified = presentCount;

    return {
      sessionId: session.id,
      courseCode: session.course.courseCode,
      courseName: session.course.courseName,
      venue: session.course.venue,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      status: session.status,
      geofenceRadius: session.geofenceRadius,
      totalStudents,
      presentCount,
      absentCount: totalStudents - presentCount,
      qrGpsVerified,
    };
  }

  /** Return active sessions for all courses a student is enrolled in */
  async getActiveForStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return [];

    const sessions = await this.prisma.session.findMany({
      where: {
        courseId: { in: courseIds },
        status: SessionStatus.ACTIVE,
      },
      include: {
        course: { select: { courseCode: true, courseName: true, venue: true } },
        attendances: {
          where: { studentId },
          select: { id: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Filter out expired sessions and return with attendance status
    const now = new Date();
    return sessions
      .filter((s) => {
        const endTime = new Date(s.startedAt.getTime() + s.duration * 60_000);
        return now <= endTime;
      })
      .map((s) => ({
        sessionId: s.id,
        courseId: s.courseId,
        courseCode: s.course.courseCode,
        courseName: s.course.courseName,
        venue: s.course.venue,
        startedAt: s.startedAt,
        duration: s.duration,
        alreadyMarked: s.attendances.length > 0,
      }));
  }

  /** Check if a student already has attendance for a given session (by courseId + active session) */
  async checkAttendance(studentId: string, courseId: string) {
    const session = await this.prisma.session.findFirst({
      where: { courseId, status: SessionStatus.ACTIVE },
    });
    if (!session) return { alreadyMarked: false };

    const existing = await this.prisma.attendance.findUnique({
      where: {
        sessionId_studentId: { sessionId: session.id, studentId },
      },
    });
    return { alreadyMarked: !!existing, sessionId: session.id };
  }

  /** Called by the cron job every minute — ends sessions whose duration has elapsed */
  async expireStale(): Promise<void> {
    const now = new Date();

    // Find all sessions still marked ACTIVE
    const active = await this.prisma.session.findMany({
      where: { status: SessionStatus.ACTIVE },
      select: { id: true, courseId: true, startedAt: true, duration: true },
    });

    const stale = active.filter((s) => {
      const endTime = new Date(s.startedAt.getTime() + s.duration * 60_000);
      return now > endTime;
    });

    if (stale.length === 0) return;

    const staleWithEndTimes = stale.map((s) => ({
      ...s,
      endedAt: new Date(s.startedAt.getTime() + s.duration * 60_000),
    }));

    await this.prisma.$transaction(
      staleWithEndTimes.map((s) =>
        this.prisma.session.updateMany({
          where: { id: s.id, status: SessionStatus.ACTIVE },
          data: { status: SessionStatus.ENDED, endedAt: s.endedAt },
        }),
      ),
    );

    // Notify connected clients for each expired session
    for (const s of staleWithEndTimes) {
      this.events.emitSessionEnded(s.id);
      this.events.emitSessionEndedToCourse(s.courseId, s.id);
    }
  }
}

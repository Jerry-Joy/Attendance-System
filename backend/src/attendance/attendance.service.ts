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
      await this.createAbsencesForSession(session.id, session.courseId, endTime);
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
    if (
      session.latitude == null ||
      session.longitude == null ||
      session.lecturerAccuracy == null
    ) {
      throw new BadRequestException(
        'Session location metadata is incomplete. Ask your lecturer to restart the session and recapture location.',
      );
    }

    const distance = haversineDistance(
      session.latitude,
      session.longitude,
      dto.latitude,
      dto.longitude,
    );

    const lecturerAccuracy = this.normalizeAccuracy(
      session.lecturerAccuracy,
      'lecturer',
    );
    const studentAccuracy = this.normalizeAccuracy(dto.accuracy, 'student');
    const dynamicBuffer = this.getDynamicGpsBuffer(
      lecturerAccuracy,
      studentAccuracy,
    );
    const effectiveRadius = session.geofenceRadius + dynamicBuffer;
    if (distance > effectiveRadius) {
      throw new BadRequestException(
        `You are ${Math.round(distance)}m from the venue. Required base radius is ${session.geofenceRadius}m (effective limit ${Math.round(effectiveRadius)}m after GPS tolerance).`,
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

  private normalizeAccuracy(
    accuracy: number | null | undefined,
    source: 'lecturer' | 'student',
  ): number {
    if (typeof accuracy !== 'number' || Number.isNaN(accuracy)) {
      throw new BadRequestException(
        `${source === 'lecturer' ? 'Lecturer' : 'Student'} GPS accuracy is missing. Please retry with a fresh location capture.`,
      );
    }
    return Math.min(Math.max(accuracy, 0), 200);
  }

  private getDynamicGpsBuffer(
    lecturerAccuracy: number,
    studentAccuracy: number,
  ): number {
    const rawBuffer = Math.round(lecturerAccuracy + studentAccuracy);
    return Math.min(Math.max(rawBuffer, 20), 100);
  }

  async getHistory(studentId: string) {
    await this.ensureAbsencesForStudent(studentId);
    const [attendances, absences] = await Promise.all([
      this.prisma.attendance.findMany({
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
      }),
      this.prisma.absence.findMany({
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
      }),
    ]);

    const attendanceRecords = attendances.map((r) => ({
      id: r.id,
      courseCode: r.session.course.courseCode,
      courseName: r.session.course.courseName,
      lecturer: r.session.lecturer.fullName,
      date: r.session.startedAt,
      markedAt: r.markedAt,
      method: r.method,
      distance: r.distance,
      status: 'present',
    }));

    const absenceRecords = absences.map((r) => ({
      id: r.id,
      courseCode: r.session.course.courseCode,
      courseName: r.session.course.courseName,
      lecturer: r.session.lecturer.fullName,
      date: r.session.startedAt,
      markedAt: r.markedAt,
      method: null,
      distance: null,
      status: 'absent',
    }));

    return [...attendanceRecords, ...absenceRecords].sort(
      (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
    );
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

  private async createAbsencesForSession(
    sessionId: string,
    courseId: string,
    endedAt: Date,
  ) {
    const [enrollments, attendances] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { courseId },
        select: { studentId: true },
      }),
      this.prisma.attendance.findMany({
        where: { sessionId },
        select: { studentId: true },
      }),
    ]);

    const presentIds = new Set(attendances.map((a) => a.studentId));
    const missing = enrollments.filter((e) => !presentIds.has(e.studentId));
    if (missing.length === 0) return;

    await this.prisma.absence.createMany({
      data: missing.map((m) => ({
        sessionId,
        studentId: m.studentId,
        markedAt: endedAt,
      })),
      skipDuplicates: true,
    });
  }

  private async ensureAbsencesForStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return;

    const now = new Date();
    const sessions = await this.prisma.session.findMany({
      where: {
        courseId: { in: courseIds },
        status: { in: [SessionStatus.ENDED, SessionStatus.ACTIVE] },
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        duration: true,
        status: true,
      },
    });
    if (sessions.length === 0) return;

    const getEndedAt = (session: { startedAt: Date; endedAt: Date | null; duration: number }) =>
      session.endedAt ?? new Date(session.startedAt.getTime() + session.duration * 60_000);

    const expiredActive = sessions.filter(
      (s) =>
        s.status === SessionStatus.ACTIVE &&
        getEndedAt(s).getTime() <= now.getTime(),
    );

    if (expiredActive.length > 0) {
      await this.prisma.$transaction(
        expiredActive.map((s) =>
          this.prisma.session.updateMany({
            where: { id: s.id, status: SessionStatus.ACTIVE },
            data: { status: SessionStatus.ENDED, endedAt: getEndedAt(s) },
          }),
        ),
      );

      for (const s of expiredActive) {
        s.status = SessionStatus.ENDED;
        s.endedAt = getEndedAt(s);
      }
    }

    const endedSessions = sessions.filter(
      (s) => s.status === SessionStatus.ENDED,
    );
    if (endedSessions.length === 0) return;

    const sessionIds = endedSessions.map((s) => s.id);
    const [attendances, absences] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { studentId, sessionId: { in: sessionIds } },
        select: { sessionId: true },
      }),
      this.prisma.absence.findMany({
        where: { studentId, sessionId: { in: sessionIds } },
        select: { sessionId: true },
      }),
    ]);

    const presentSet = new Set(attendances.map((a) => a.sessionId));
    const absentSet = new Set(absences.map((a) => a.sessionId));
    const missing = endedSessions.filter(
      (s) => !presentSet.has(s.id) && !absentSet.has(s.id),
    );
    if (missing.length === 0) return;

    await this.prisma.absence.createMany({
      data: missing.map((s) => ({
        sessionId: s.id,
        studentId,
        markedAt: getEndedAt(s),
      })),
      skipDuplicates: true,
    });
  }
}

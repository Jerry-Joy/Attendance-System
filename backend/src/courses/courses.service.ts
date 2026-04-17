import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

// No ambiguous characters
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateJoinCode(courseCode: string): string {
  const clean = courseCode.replace(/\s+/g, '').toUpperCase();
  let suffix = '';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    suffix += CHARSET[bytes[i] % CHARSET.length];
  }
  return `${clean}-${suffix}`;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) { }

  async create(lecturerId: string, dto: CreateCourseDto) {
    // Generate a unique join code
    let joinCode: string;
    let attempts = 0;
    do {
      joinCode = generateJoinCode(dto.courseCode);
      const existing = await this.prisma.course.findUnique({
        where: { joinCode },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    return this.prisma.course.create({
      data: {
        courseCode: dto.courseCode,
        courseName: dto.courseName,
        joinCode,
        venue: dto.venue,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        lecturerId,
      },
      include: { _count: { select: { enrollments: true } } },
    });
  }

  async findAllForUser(userId: string, role: Role) {
    if (role === Role.LECTURER) {
      return this.prisma.course.findMany({
        where: { lecturerId: userId },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    // Student — return courses they're enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: { _count: { select: { enrollments: true } } },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    return enrollments.map((e) => e.course);
  }

  async findOneForUser(courseId: string, userId: string, role: Role) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true, staffId: true },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      throw new ForbiddenException('You do not own this course');
    }

    if (role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
      });
      if (!enrollment)
        throw new ForbiddenException('You are not enrolled in this course');
    }

    return course;
  }

  async update(courseId: string, lecturerId: string, dto: UpdateCourseDto) {
    const course = await this.ensureOwner(courseId, lecturerId);
    return this.prisma.course.update({
      where: { id: course.id },
      data: dto,
      include: { _count: { select: { enrollments: true } } },
    });
  }

  async remove(courseId: string, lecturerId: string) {
    const course = await this.ensureOwner(courseId, lecturerId);
    await this.prisma.course.delete({ where: { id: course.id } });
    return { deleted: true };
  }

  async previewCourse(studentId: string, joinCode: string) {
    const normalizedJoinCode = this.normalizeJoinCode(joinCode);

    const course = await this.prisma.course.findUnique({
      where: { joinCode: normalizedJoinCode },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!course) throw new NotFoundException('Invalid join code');

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId: course.id },
      },
    });

    return {
      course,
      alreadyEnrolled: !!existing,
    };
  }

  async joinCourse(studentId: string, joinCode: string) {
    const normalizedJoinCode = this.normalizeJoinCode(joinCode);

    const course = await this.prisma.course.findUnique({
      where: { joinCode: normalizedJoinCode },
    });
    if (!course) throw new NotFoundException('Invalid join code');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: course.id } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    await this.prisma.enrollment.create({
      data: { studentId, courseId: course.id },
    });

    return this.prisma.course.findUnique({
      where: { id: course.id },
      include: { _count: { select: { enrollments: true } } },
    });
  }

  async getStudents(courseId: string, lecturerId: string) {
    await this.ensureOwner(courseId, lecturerId);
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });
    return enrollments.map((e) => ({
      ...e.student,
      enrolledAt: e.enrolledAt,
    }));
  }

  async removeStudent(
    courseId: string,
    studentId: string,
    lecturerId: string,
  ) {
    await this.ensureOwner(courseId, lecturerId);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('Student not enrolled');
    await this.prisma.enrollment.delete({ where: { id: enrollment.id } });
    return { removed: true };
  }

  private async ensureOwner(courseId: string, lecturerId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.lecturerId !== lecturerId)
      throw new ForbiddenException('You do not own this course');
    return course;
  }

  private normalizeJoinCode(joinCode: string) {
    return joinCode.trim().toUpperCase();
  }
}

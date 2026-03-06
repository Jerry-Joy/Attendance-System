import 'dotenv/config';
import { PrismaClient, Role, User, Course } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Lecturer ───
  const passwordHash = await bcrypt.hash('password', 12);

  const lecturer = await prisma.user.upsert({
    where: { email: 'adeyemi@university.edu' },
    update: {},
    create: {
      email: 'adeyemi@university.edu',
      fullName: 'Prof. Adeyemi',
      passwordHash,
      role: Role.LECTURER,
      staffId: 'LEC001',
    },
  });
  console.log(`  ✓ Lecturer: ${lecturer.fullName} (${lecturer.email})`);

  // ─── Create Students ───
  const students = [
    { email: 'james.doe@student.edu', fullName: 'James Doe', studentId: 'CSC/2022/001' },
    { email: 'sarah.alli@student.edu', fullName: 'Sarah Alli', studentId: 'CSC/2022/015' },
    { email: 'david.chen@student.edu', fullName: 'David Chen', studentId: 'CSC/2022/023' },
    { email: 'chioma.obi@student.edu', fullName: 'Chioma Obi', studentId: 'CSC/2022/008' },
    { email: 'emeka.nwosu@student.edu', fullName: 'Emeka Nwosu', studentId: 'CSC/2022/042' },
    { email: 'fatima.yusuf@student.edu', fullName: 'Fatima Yusuf', studentId: 'CSC/2022/019' },
    { email: 'tunde.bakare@student.edu', fullName: 'Tunde Bakare', studentId: 'CSC/2022/031' },
    { email: 'grace.eze@student.edu', fullName: 'Grace Eze', studentId: 'CSC/2022/011' },
  ];

  const createdStudents: User[] = [];
  for (const s of students) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        fullName: s.fullName,
        passwordHash,
        role: Role.STUDENT,
        studentId: s.studentId,
      },
    });
    createdStudents.push(student);
    console.log(`  ✓ Student: ${student.fullName} (${student.studentId})`);
  }

  // ─── Create Courses ───
  const courses = [
    { courseCode: 'CSC 401', courseName: 'Software Engineering', joinCode: 'CSC401-XK9F', venue: 'Room 301, CS Building', dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '12:00' },
    { courseCode: 'CSC 405', courseName: 'Computer Networks', joinCode: 'CSC405-MP2Q', venue: 'Hall 2, Engineering Block', dayOfWeek: 'Monday', startTime: '14:00', endTime: '16:00' },
    { courseCode: 'CSC 411', courseName: 'Artificial Intelligence', joinCode: 'CSC411-BN7W', venue: 'Lecture Theatre A', dayOfWeek: 'Friday', startTime: '09:00', endTime: '11:00' },
  ];

  const createdCourses: Course[] = [];
  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { joinCode: c.joinCode },
      update: {},
      create: { ...c, lecturerId: lecturer.id },
    });
    createdCourses.push(course);
    console.log(`  ✓ Course: ${course.courseCode} — ${course.courseName} (${course.joinCode})`);
  }

  // ─── Enroll students (matching mock data) ───
  // CSC 401: all 8 students
  for (const student of createdStudents) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: createdCourses[0].id } },
      update: {},
      create: { studentId: student.id, courseId: createdCourses[0].id },
    });
  }
  console.log(`  ✓ Enrolled all 8 students in CSC 401`);

  // CSC 405: James, David, Emeka
  const csc405Students = [createdStudents[0], createdStudents[2], createdStudents[4]];
  for (const student of csc405Students) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: createdCourses[1].id } },
      update: {},
      create: { studentId: student.id, courseId: createdCourses[1].id },
    });
  }
  console.log(`  ✓ Enrolled 3 students in CSC 405`);

  // CSC 411: James, Sarah, Chioma, Fatima
  const csc411Students = [createdStudents[0], createdStudents[1], createdStudents[3], createdStudents[5]];
  for (const student of csc411Students) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: createdCourses[2].id } },
      update: {},
      create: { studentId: student.id, courseId: createdCourses[2].id },
    });
  }
  console.log(`  ✓ Enrolled 4 students in CSC 411`);

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Test credentials:');
  console.log('   Lecturer: adeyemi@university.edu / password');
  console.log('   Student:  james.doe@student.edu / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

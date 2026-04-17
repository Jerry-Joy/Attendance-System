import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JoinCourseDto } from './dto/join-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) { }

  @Roles(Role.LECTURER)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.coursesService.findAllForUser(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.findOneForUser(id, user.id, user.role);
  }

  @Roles(Role.LECTURER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, user.id, dto);
  }

  @Roles(Role.LECTURER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.remove(id, user.id);
  }

  @Roles(Role.STUDENT)
  @Post('join')
  joinCourse(@CurrentUser() user: any, @Body() dto: JoinCourseDto) {
    return this.coursesService.joinCourse(user.id, dto.joinCode);
  }

  @Roles(Role.STUDENT)
  @Post('preview')
  previewCourse(@CurrentUser() user: any, @Body() dto: JoinCourseDto) {
    return this.coursesService.previewCourse(user.id, dto.joinCode);
  }

  @Roles(Role.LECTURER)
  @Get(':id/students')
  getStudents(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.getStudents(id, user.id);
  }

  @Roles(Role.LECTURER)
  @Delete(':id/students/:studentId')
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.removeStudent(id, studentId, user.id);
  }
}

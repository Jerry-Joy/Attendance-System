import { IsNotEmpty, IsString } from 'class-validator';

export class JoinCourseDto {
  @IsString()
  @IsNotEmpty()
  joinCode: string;
}

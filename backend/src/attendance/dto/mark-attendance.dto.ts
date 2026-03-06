import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

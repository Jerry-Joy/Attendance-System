import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
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

  @IsNumber()
  @Min(0)
  @Max(200)
  accuracy: number;
}

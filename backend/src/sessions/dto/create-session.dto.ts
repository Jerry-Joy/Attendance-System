import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsInt()
  @Min(1)
  @Max(180)
  duration: number; // minutes

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  lecturerAccuracy?: number;

  @IsOptional()
  @IsDateString()
  lecturerLocationCapturedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(500)
  geofenceRadius?: number;
}

import {
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
  @IsInt()
  @Min(30)
  @Max(500)
  geofenceRadius?: number;
}

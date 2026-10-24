import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  date?: string | Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @IsOptional()
  pointsAwarded?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  qrRefreshInterval?: number;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fakultas?: string;
}

export class UpdateProfileResponseDto {
  id: string;
  name: string;
  email: string;
  fakultas: string;
  avatar: string | null;
  role: string;
}

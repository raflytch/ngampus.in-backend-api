import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Kategori } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fakultas?: string;

  @IsOptional()
  @IsEnum(Kategori)
  kategori?: Kategori;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Kategori } from '@prisma/client';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fakultas: string;

  @IsOptional()
  @IsEnum(Kategori)
  kategori?: Kategori;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

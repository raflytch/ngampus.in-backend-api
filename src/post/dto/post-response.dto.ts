import { Kategori, Role } from '@prisma/client';

export class PostAuthorDto {
  id: string;
  name: string;
  fakultas: string;
  avatar: string | null;
  role: Role;
}

export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  image: string | null;
  isAnonymous: boolean;
  kategori: Kategori | null;
  fakultas: string;
  author: PostAuthorDto | null;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: Date;
}

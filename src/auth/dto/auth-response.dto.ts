import { Role, Kategori } from '@prisma/client';

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

export class AuthResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    fakultas: string;
    avatar: string;
    role: Role;
  };
  posts?: PostResponseDto[];
  access_token: string;
}

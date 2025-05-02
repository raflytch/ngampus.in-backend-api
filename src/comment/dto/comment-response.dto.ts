import { Role } from '@prisma/client';

export class CommentAuthorDto {
  id: string;
  name: string;
  fakultas: string;
  avatar: string | null;
  role: Role;
}

export class CommentResponseDto {
  id: string;
  content: string;
  postId: string;
  author: CommentAuthorDto;
  createdAt: Date;
}

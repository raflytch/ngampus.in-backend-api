import { Kategori } from '@prisma/client';

export interface Post {
  id: string;
  title: string;
  content: string;
  image: string | null;
  isAnonymous: boolean;
  kategori: Kategori | null;
  fakultas: string;
  authorId: string | null;
  createdAt: Date;
}

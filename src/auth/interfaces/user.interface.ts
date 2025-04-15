import { Role } from '@prisma/client';

export interface User {
  id: string;
  name: string;
  email: string;
  fakultas: string;
  avatar?: string | null;
  role: Role;
  createdAt: Date;
}

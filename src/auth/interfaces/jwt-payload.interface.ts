import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  fakultas: string;
  avatar: string;
  role: Role;
  createdAt: string;
  iat?: number;
  exp?: number;
}

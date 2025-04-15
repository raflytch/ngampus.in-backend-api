import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  fakultas: string;
  avatar: string | null;
  role: Role;
  createdAt: Date;
}

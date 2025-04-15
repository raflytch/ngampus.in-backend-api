import { Role } from '@prisma/client';

export class RegisterResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    fakultas: string;
    avatar: string;
    role: Role;
  };
}

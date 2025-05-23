import { Role } from '@prisma/client';

export class UpdateAvatarResponseDto {
  id: string;
  name: string;
  email: string;
  fakultas: string;
  avatar: string;
  role: Role;
}

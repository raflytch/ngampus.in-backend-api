import { Role } from 'generated/prisma';

export class AuthResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    fakultas: string;
    avatar: string;
    role: Role;
  };
  access_token: string;
}

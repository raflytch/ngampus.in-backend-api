import { Role } from '@prisma/client';

export class GoogleUserDto {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export class GoogleAuthUrlResponseDto {
  url: string;
}

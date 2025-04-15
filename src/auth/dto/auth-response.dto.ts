export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    fakultas: string;
    avatar?: string;
    role: string;
  };
}

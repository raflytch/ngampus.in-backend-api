export class RegisterResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    fakultas: string;
    avatar?: string;
    role: string;
  };
}

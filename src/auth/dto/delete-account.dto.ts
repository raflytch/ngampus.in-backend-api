import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAccountDeletionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class ConfirmAccountDeletionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class DeleteAccountResponseDto {
  message: string;
}

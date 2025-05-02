import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
  Patch,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAvatarResponseDto } from './dto/update-avatar.dto';
import {
  UpdateProfileDto,
  UpdateProfileResponseDto,
} from './dto/update-profile.dto';
import {
  RequestPasswordResetDto,
  VerifyOtpDto,
  ResetPasswordDto,
  OtpResponseDto,
} from './dto/password-reset.dto';
import {
  RequestAccountDeletionDto,
  ConfirmAccountDeletionDto,
  DeleteAccountResponseDto,
} from './dto/delete-account.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req): AuthResponseDto {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.getProfileFromToken(token);
  }

  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateAvatarResponseDto> {
    return this.authService.updateAvatar(userId, file);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Post('password/request-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestDto: RequestPasswordResetDto,
  ): Promise<OtpResponseDto> {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyDto: VerifyOtpDto): Promise<OtpResponseDto> {
    return this.authService.verifyOtp(verifyDto);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetDto: ResetPasswordDto,
  ): Promise<OtpResponseDto> {
    return this.authService.resetPassword(resetDto);
  }

  @Post('account/request-deletion')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestAccountDeletion(
    @GetUser('id') userId: string,
  ): Promise<OtpResponseDto> {
    const requestDto: RequestAccountDeletionDto = { userId };
    return this.authService.requestAccountDeletion(requestDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @GetUser('id') userId: string,
    @Body('otp') otp: string,
  ): Promise<DeleteAccountResponseDto> {
    const confirmDto: ConfirmAccountDeletionDto = { userId, otp };
    return this.authService.confirmAccountDeletion(confirmDto);
  }
}

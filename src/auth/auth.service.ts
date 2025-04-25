import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { ImagekitService } from '../common/imagekit/imagekit.service';
import { UpdateAvatarResponseDto } from './dto/update-avatar.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './interfaces/user.interface';
import { EmailService } from '../common/email/email.service';
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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private imagekitService: ImagekitService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { name, email, password, fakultas } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        fakultas,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fakultas: user.fakultas,
        avatar: user.avatar || '',
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      fakultas: user.fakultas,
      avatar: user.avatar || '',
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fakultas: user.fakultas,
        avatar: user.avatar || '',
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UpdateAvatarResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadResult = await this.imagekitService.upload(file, 'avatars');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      fakultas: updatedUser.fakultas,
      avatar: updatedUser.avatar || '',
      role: updatedUser.role,
    };
  }

  async validateUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  getProfileFromToken(token: string): AuthResponseDto {
    try {
      const decoded = this.jwtService.verify(token);

      return {
        user: {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          fakultas: decoded.fakultas,
          avatar: decoded.avatar,
          role: decoded.role,
        },
        access_token: token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name || user.name,
        email: updateProfileDto.email || user.email,
        fakultas: updateProfileDto.fakultas || user.fakultas,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      fakultas: updatedUser.fakultas,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOtpExpiry(): Date {
    return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  }

  async requestPasswordReset(
    requestDto: RequestPasswordResetDto,
  ): Promise<OtpResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: requestDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpires = this.getOtpExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpires },
    });

    await this.emailService.sendOtp(user.email, otp, 'reset');

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<OtpResponseDto> {
    const { email, otp } = verifyOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpires) {
      throw new BadRequestException('No OTP request found');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<OtpResponseDto> {
    const { email, otp, password } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpires) {
      throw new BadRequestException('No OTP request found');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async requestAccountDeletion(
    requestDto: RequestAccountDeletionDto,
  ): Promise<OtpResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: requestDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpires = this.getOtpExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpires },
    });

    await this.emailService.sendOtp(user.email, otp, 'delete');

    return { message: 'OTP sent to your email' };
  }

  async confirmAccountDeletion(
    confirmDto: ConfirmAccountDeletionDto,
  ): Promise<DeleteAccountResponseDto> {
    const { userId, otp } = confirmDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpires) {
      throw new BadRequestException('No OTP request found');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return { message: 'Account deleted successfully' };
  }
}

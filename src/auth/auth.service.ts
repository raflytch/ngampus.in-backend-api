import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private imagekitService: ImagekitService,
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
}

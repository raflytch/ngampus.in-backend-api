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
import { User } from './interfaces/user.interface';

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
}

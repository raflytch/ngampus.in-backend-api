import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL') || '';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }

  get imagekitPublicKey(): string {
    return this.configService.get<string>('IMAGEKIT_PUBLIC_KEY') || '';
  }

  get imagekitPrivateKey(): string {
    return this.configService.get<string>('IMAGEKIT_PRIVATE_KEY') || '';
  }

  get imagekitUrlEndpoint(): string {
    return this.configService.get<string>('IMAGEKIT_URL_ENDPOINT') || '';
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'secret';
  }

  get emailUser(): string {
    return this.configService.get<string>('EMAIL_USER') || '';
  }

  get emailPassword(): string {
    return this.configService.get<string>('EMAIL_PASS') || '';
  }

  get googleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
  }

  get googleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
  }
}

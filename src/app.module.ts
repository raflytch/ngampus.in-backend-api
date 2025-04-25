import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ImagekitModule } from './common/imagekit/imagekit.module';
import { FiltersModule } from './common/filters/filters.module';
import { EmailModule } from './common/email/email.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ImagekitModule,
    FiltersModule,
    EmailModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

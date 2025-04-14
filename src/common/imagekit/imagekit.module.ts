import { Global, Module } from '@nestjs/common';
import { ImagekitService } from './imagekit.service';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ImagekitService],
  exports: [ImagekitService],
})
export class ImagekitModule {}

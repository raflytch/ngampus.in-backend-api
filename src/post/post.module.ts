import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ImagekitModule } from '../common/imagekit/imagekit.module';

@Module({
  imports: [PrismaModule, ImagekitModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

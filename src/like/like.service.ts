import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { LikeResponseDto } from './dto/like-response.dto';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createLikeDto: CreateLikeDto,
    userId: string,
  ): Promise<LikeResponseDto> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: createLikeDto.postId },
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: createLikeDto.postId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    const like = await this.prisma.like.create({
      data: {
        postId: createLikeDto.postId,
        userId,
      },
    });

    return like;
  }

  async remove(postId: string, userId: string): Promise<{ message: string }> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return { message: 'Like removed successfully' };
  }
}

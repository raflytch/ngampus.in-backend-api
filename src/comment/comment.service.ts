import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            fakultas: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return comment;
  }

  async findByPostId(postId: string): Promise<CommentResponseDto[]> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            fakultas: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return comments;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    userRole: Role,
  ): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            fakultas: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }
}

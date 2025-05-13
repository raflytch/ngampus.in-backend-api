import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ImagekitService } from '../common/imagekit/imagekit.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  PaginatedResponseDto,
  PaginationMeta,
} from '../common/dto/paginated-response.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private imagekitService: ImagekitService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<PostResponseDto> {
    const userWithFakultas = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fakultas: true },
    });

    if (!userWithFakultas) {
      throw new NotFoundException('User not found');
    }

    let imageUrl: string | null = null;
    if (file) {
      const uploadResult = await this.imagekitService.upload(file, 'posts');
      imageUrl = uploadResult.url;
    }

    const isAnonymous =
      typeof createPostDto.isAnonymous === 'string'
        ? createPostDto.isAnonymous === 'true'
        : !!createPostDto.isAnonymous;

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        image: imageUrl,
        kategori: createPostDto.kategori,
        isAnonymous: isAnonymous,
        fakultas: createPostDto.fakultas || userWithFakultas.fakultas,
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

    const [likesCount, commentsCount] = await Promise.all([
      this.prisma.like.count({ where: { postId: post.id } }),
      this.prisma.comment.count({ where: { postId: post.id } }),
    ]);

    return {
      ...post,
      likesCount,
      commentsCount,
    };
  }

  async findAll(
    paginationDto: PaginationDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    let postsWithLikeInfo = posts.map((post) => {
      const { _count, ...postWithoutCount } = post;
      return {
        ...postWithoutCount,
        likesCount: _count.likes,
        commentsCount: _count.comments,
        isLiked: false,
      };
    });

    if (userId) {
      const userLikes = await this.prisma.like.findMany({
        where: {
          userId,
          postId: { in: posts.map((post) => post.id) },
        },
        select: { postId: true },
      });

      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      postsWithLikeInfo = postsWithLikeInfo.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));
    }

    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      statusCode: 200,
      message: 'Posts retrieved successfully',
      data: postsWithLikeInfo,
      meta,
    };
  }

  async findOne(id: string, userId?: string): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let isLiked = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId,
          },
        },
      });
      isLiked = !!like;
    }

    const { _count, ...postWithoutCount } = post;
    return {
      ...postWithoutCount,
      likesCount: _count.likes,
      commentsCount: _count.comments,
      isLiked,
    };
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    userRole: Role,
  ): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const isAnonymous =
      typeof updatePostDto.isAnonymous === 'string'
        ? updatePostDto.isAnonymous === 'true'
        : updatePostDto.isAnonymous;

    const updatedPostData = {
      ...updatePostDto,
      isAnonymous:
        updatePostDto.isAnonymous !== undefined ? isAnonymous : undefined,
    };

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatedPostData,
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

    return {
      ...updatedPost,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    };
  }

  async updateImage(
    id: string,
    file: Express.Multer.File,
    userId: string,
    userRole: Role,
  ): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const uploadResult = await this.imagekitService.upload(file, 'posts');

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { image: uploadResult.url },
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

    return {
      ...updatedPost,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    };
  }

  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { postId: id },
      });

      await tx.like.deleteMany({
        where: { postId: id },
      });

      await tx.post.delete({
        where: { id },
      });
    });

    return { message: 'Post deleted successfully' };
  }
}

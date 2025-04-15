import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  PaginatedResponseDto,
  PaginationMeta,
} from '../common/dto/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    const userResponses: UserResponseDto[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      fakultas: user.fakultas,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    }));

    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: userResponses,
      meta,
    };
  }
}

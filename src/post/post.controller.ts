import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerMemoryConfig } from '../common/multer/multer-memory.config';
import { Role } from '@prisma/client';

@Controller('/api/v1/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerMemoryConfig))
  create(
    @Body() createPostDto: CreatePostDto,
    @GetUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postService.create(createPostDto, userId, file);
  }

  @Get('admin')
  @Roles('ADMIN')
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.postService.findAll(paginationDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetUser('id') userId: string,
  ) {
    return this.postService.findAll(paginationDto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.postService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.postService.update(id, updatePostDto, userId, userRole);
  }

  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image', multerMemoryConfig))
  updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.postService.updateImage(id, file, userId, userRole);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.postService.remove(id, userId, userRole);
  }
}

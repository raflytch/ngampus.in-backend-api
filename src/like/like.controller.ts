import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('/api/v1/likes')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  create(@Body() createLikeDto: CreateLikeDto, @GetUser('id') userId: string) {
    return this.likeService.create(createLikeDto, userId);
  }

  @Delete(':postId')
  remove(@Param('postId') postId: string, @GetUser('id') userId: string) {
    return this.likeService.remove(postId, userId);
  }
}

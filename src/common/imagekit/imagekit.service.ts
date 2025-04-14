import { Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ImagekitService {
  private imagekit: ImageKit;

  constructor(private configService: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: this.configService.imagekitPublicKey,
      privateKey: this.configService.imagekitPrivateKey,
      urlEndpoint: this.configService.imagekitUrlEndpoint,
    });
  }

  async upload(file: Express.Multer.File, folder: string) {
    try {
      const uploadResult = await this.imagekit.upload({
        file: file.buffer.toString('base64'),
        fileName: `${Date.now()}_${file.originalname}`,
        folder: folder,
      });

      return {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      throw new Error(`ImageKit upload failed: ${error.message}`);
    }
  }

  async delete(fileId: string) {
    try {
      await this.imagekit.deleteFile(fileId);
      return { success: true };
    } catch (error) {
      throw new Error(`ImageKit delete failed: ${error.message}`);
    }
  }
}

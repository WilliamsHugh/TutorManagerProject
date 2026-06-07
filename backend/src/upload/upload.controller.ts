import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';
import { CLOUDINARY } from './cloudinary.provider';

@Controller('upload')
export class UploadController {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: any) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'), false);
        }
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    // Upload buffer to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'limit', quality: 'auto' },
          ],
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Không thể tải ảnh lên Cloudinary'));
          } else resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });

    return { url: result.secure_url };
  }

  @Post('cv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for CV files
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Chỉ chấp nhận file PDF, DOC, DOCX, JPEG, PNG (Tối đa 10MB)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadCv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file CV');
    }

    const resourceType = file.mimetype.startsWith('image') ? 'image' : 'raw';

    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: 'cvs',
            resource_type: resourceType,
            type: 'upload',
            public_id: `cv_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Cloudinary CV upload error:', error);
              reject(new Error('Không thể tải CV lên Cloudinary'));
            } else resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      },
    );

    // Generate signed URL for raw files (Cloudinary authenticated delivery)
    const signedUrl = this.cloudinary.url(result.public_id, {
      resource_type: resourceType,
      type: 'upload',
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 365 days
    });

    return {
      url: signedUrl,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }
}

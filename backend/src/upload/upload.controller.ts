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
          cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    // Bypass if Cloudinary is not configured (for local dev)
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary is not configured. Returning mock avatar URL.');
      return { url: 'https://via.placeholder.com/400x400.png?text=Mock+Avatar' };
    }

    // Upload buffer to Cloudinary
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
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
      },
    );

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

    // Bypass if Cloudinary is not configured (for local dev)
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary is not configured. Returning mock CV URL.');
      return {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: file.originalname,
        fileSize: file.size,
      };
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

    // Trả về trực tiếp secure_url (URL public) do Cloudinary cung cấp.
    // Việc ký (sign_url) thủ công một file dạng 'upload' (public) có thể gây lỗi 
    // không xem được do cấu hình tài khoản Cloudinary (Strict Delivery / Restrict PDF).
    return {
      url: result.secure_url,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }
}

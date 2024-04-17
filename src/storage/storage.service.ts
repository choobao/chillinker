import { Bucket, Storage } from '@google-cloud/storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

/** 랜덤 문자열 생성 함수 */
export const randomName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

@Injectable()
export class StorageService {
  private bucket: Bucket;
  private storage: Storage;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get<string>('PROJECT_ID'),
      credentials: {
        client_email: this.configService.get<string>('CLIENT_EMAIL'),
        private_key: this.configService
          .get<string>('PRIVATE_KEY')
          .split(String.raw`\n`)
          .join('\n'),
      },
    });

    this.bucket = this.storage.bucket(
      configService.get('STORAGE_MEDIA_BUCKET'),
    );
  }

  async upload(file: Express.Multer.File) {
    const filename = randomName() + file.mimetype.replace('/', '.');
    const writeStream = this.bucket.file(filename).createWriteStream();
    writeStream.on('error', (err) => {
      console.log(err);
      throw err;
    });
    writeStream.on('finish', () => {
      console.log('file upload success');
    });
    writeStream.end(file.buffer);

    const uploadedFileUrl = `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
    return uploadedFileUrl;
  }

  async delete(uploadedFileUrl: string) {
    try {
      const filename = uploadedFileUrl.split('chillinker/')[1];
      await this.bucket.file(filename).delete();
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}

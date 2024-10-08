import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FileService {
  createMulterFile(filePath: string): Express.Multer.File {
    let fileBuffer: Buffer;
    let fileStat: fs.Stats;

    try {
      fileBuffer = fs.readFileSync(filePath);
      fileStat = fs.statSync(filePath);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error reading file: ${error.message}`,
      );
    }

    const mimeType = this.getMimeType(filePath);

    return {
      fieldname: 'file',
      originalname: path.basename(filePath),
      encoding: '7bit',
      mimetype: mimeType,
      size: fileStat.size,
      destination: '',
      filename: path.basename(filePath),
      path: filePath,
      buffer: fileBuffer,
    } as Express.Multer.File;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.mp4':
        return 'video/mp4';
      default:
        return 'application/octet-stream';
    }
  }
}

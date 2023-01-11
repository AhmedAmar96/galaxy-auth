import {
  BadRequestException,
  HttpException,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { RollbarLogger } from 'nestjs-rollbar';
import { getErrorMessage } from '../exceptions/error-filter';

@Injectable()
export class S3Service {
  constructor(private readonly rollbarLogger: RollbarLogger) {}
  private AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    region: 'eu-central-1',
  });

  public async uploadFile(file) {
    let { originalname } = file;
    if (process.env.MODE === 'DEV') originalname = `stage_${originalname}`;
    let result = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimeType,
    );
    
    return originalname;
  }
  public async getImage(name:string){
    
    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.AWS_S3_BUCKET,
      Key: name,
      Expires: 60,
    });
    return signedUrl
  }
  public async getSheet(name:string){
    
    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.AWS_S3_BUCKET,
      Key: name,
      Expires: 60*5,
    });
    return signedUrl
  }
  private async s3_upload(file, bucket, name, mimeType) {
    const params = {
      Bucket: bucket,
      Key: name,
      Body: file,
      ContentType: mimeType,
      ContentDisposition: 'inline',
    };

    try {
      let s3Response = await this.s3.upload(params).promise();

      return s3Response.Location;
    } catch (e) {
      this.rollbarLogger.error(
        `Error In [Auth Service - AWS S3 Function] : ${getErrorMessage(e)}`,
      );
      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }


  public async uploadBase64(base64, originalname) {
    try {
      let buffer = Buffer.from(base64, 'base64');
      let file;
      let mimeType;
      switch (base64.slice(0, 5)) {
        case '/9j/4':
          mimeType = 'image/jpeg';
          originalname += '.jpeg';
          break;
        case 'iVBOR':
          mimeType = 'image/png';
          originalname += '.png';
          break;
        default:
          throw new BadRequestException('Can not upload this file');
      }
      file = { buffer, originalname, mimeType };
      let location = await this.uploadFile(file);
      return location;
    } catch (e) {
      this.rollbarLogger.error(
        `Error In [HIMU Service - Upload Base64 Function] : ${getErrorMessage(
          e,
        )}`,
      );
      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }
}

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Sanitize the value here and return the sanitized value.
    let sanitizedValue_1 = value.replace(/<[^>]+>/g, '');
    let sanitizedValue_2 = sanitizedValue_1.replace(/[^\w\s]/gi, '');
    return plainToClass(sanitizedValue_2, {excludeExtraneousValues:true}) as object as any; 
  }
}
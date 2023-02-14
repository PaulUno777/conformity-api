/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCompleteDto {
  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  dob?: string;

  @ApiPropertyOptional()
  nationality?: string[];
}

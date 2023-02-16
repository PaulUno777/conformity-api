import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Header,
  Param,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchCompleteDto } from './dto/search.complete.dto';
import { join } from 'path';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';

@Controller('search')
@ApiTags('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private config: ConfigService,
  ) {}

  @ApiQuery({
    name: 'text',
    description: 'text to search',
    required: true,
    type: 'string',
  })
  @Get()
  findSimple(@Query() query: Record<string, any>) {
    return this.searchService.search(String(query.text));
  }

  @Post()
  findComplete(@Body() body: SearchCompleteDto) {
    return this.searchService.searchComplete(body);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xlsx')
  @Get('download/:file')
  async download(@Param('file') fileName, @Res() response: Response) {
    const dir = this.config.get('FILE_LOCATION');
    const file: any = createReadStream(join(process.cwd(), dir + fileName));
    file.pipe(response);
  }
}

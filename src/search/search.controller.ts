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

@Controller('search')
@ApiTags('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

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
    const file: any = createReadStream(
      join(process.cwd(), 'public/' + fileName),
    );
    file.pipe(response);
  }
}

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
  StreamableFile,
  Response,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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

  @ApiQuery({
    name: 'fullName',
    description: 'text to search',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'dob',
    description: 'date of birth of entity',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'nationality',
    description: 'natinality of entity',
    required: false,
    type: 'string',
  })
  @Get('complete')
  findCompeteGet(@Query() query: Record<string, any>) {
    const body = {
      fullName: '',
    };
    if (query.fullName) body['fullName'] = String(query.fullName);
    if (query.dob) body['dob'] = query.dob;
    if (query.nationality) body['nationality'] = JSON.parse(query.nationality);

    console.log(body);

    return this.searchService.searchComplete(body);
  }

  @Post()
  findComplete(@Body() body: SearchCompleteDto) {
    return this.searchService.searchComplete(body);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xlsx')
  @Get('download/:file')
  download(
    @Param('file') fileName,
    @Response({ passthrough: true }) res,
  ): StreamableFile {
    res.set({
      'Content-Type': 'application/xlsx',
      'Content-Disposition': 'attachment; filename="seach-result.xlsx',
    });
    const dir = this.config.get('FILE_LOCATION');
    const file: any = createReadStream(join(process.cwd(), dir + fileName));
    return new StreamableFile(file);
    //file.pipe(response);
  }
}

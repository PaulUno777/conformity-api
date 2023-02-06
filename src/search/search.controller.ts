import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchCompleteDto } from './dto/search.complete.dto';

@Controller('search')
@ApiTags('search')
export class SearchController {

  constructor(private readonly searchService: SearchService) {}

  @ApiQuery({
		name: "text",
		description: "text to search",
		required: true,
		type: 'string',
	})
  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.searchService.search(String(query.text));
  }

  @Post()
  findComplete(@Body() body: SearchCompleteDto) {
    return this.searchService.searchComplete(body);
  }

}

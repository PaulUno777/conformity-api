import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@Controller('search')
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
    console.log(String(query.text))
    return this.searchService.search(String(query.text));
  }

}

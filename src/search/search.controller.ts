import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SearchDto } from './dto/search.output.dto';
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
  @Get('')
  findAll(@Query() query: Record<string, any>): Promise<SearchDto> {
    return this.searchService.search(String(query.text));
  }

  @Post('complete')
  findComplete(@Query() query: Record<string, any>): Promise<SearchDto> {
    return this.searchService.search(String(query.text));
  }

}

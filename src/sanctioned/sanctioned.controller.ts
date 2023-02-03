import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { SanctionedService } from './sanctioned.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('sanctioned')
@ApiTags('sanctioned')
export class SanctionedController {
  constructor(private readonly sanctionedService: SanctionedService) {}

  @ApiQuery({
		name: "page",
		description: "The page number",
		required: false,
		type: Number
	})

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.sanctionedService.findAll(query.page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sanctionedService.findOne(id);
  }
}

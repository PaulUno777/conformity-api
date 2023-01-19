import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { SanctionedService } from './sanctioned.service';
import { CreateSanctionedDto } from './dto/create-sanctioned.dto';
import { UpdateSanctionedDto } from './dto/update-sanctioned.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('sanctioned')
export class SanctionedController {
  constructor(private readonly sanctionedService: SanctionedService) {}

  // @Post()
  // create(@Body() createSanctionedDto: CreateSanctionedDto) {
  //   return this.sanctionedService.create(createSanctionedDto);
  // }

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.sanctionedService.findAll(query.page);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sanctionedService.findOne(+id);
  // }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSanctionedDto: UpdateSanctionedDto) {
    return this.sanctionedService.update(id, updateSanctionedDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sanctionedService.remove(+id);
  // }
}

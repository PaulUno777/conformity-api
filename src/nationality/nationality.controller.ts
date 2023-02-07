import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NationalityService } from './nationality.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('nationality')
@ApiTags('nationality')
export class NationalityController {
  constructor(private readonly nationalityService: NationalityService) {}

  @Get()
  findAll() {
    return this.nationalityService.findAll();
  }
}

import { Module } from '@nestjs/common';
import { NationalityService } from './nationality.service';
import { NationalityController } from './nationality.controller';

@Module({
  controllers: [NationalityController],
  providers: [NationalityService]
})
export class NationalityModule {}

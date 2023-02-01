import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { MigrationHelper } from './migration.helper';

@Module({
  controllers: [MigrationController],
  providers: [MigrationService, MigrationHelper]
})
export class MigrationModule {}

import { Controller, Get } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) {}
    @Get()
    getHello() {
        return this.migrationService.migrateAllToMongo();
    }
}


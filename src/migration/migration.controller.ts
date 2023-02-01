import { Controller, Get } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) {}
    @Get('make')
    getHello() {
        return this.migrationService.migrateAllToMongo();
    }

    @Get('update')
    async update(){
        return this.migrationService.updateAllToMongo();
    }
}


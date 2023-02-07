import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SanctionedModule } from './sanctioned/sanctioned.module';
import { SearchModule } from './search/search.module';
import { MigrationModule } from './migration/migration.module';
import { NationalityModule } from './nationality/nationality.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SanctionedModule, SearchModule, MigrationModule, NationalityModule],
})
export class AppModule {}

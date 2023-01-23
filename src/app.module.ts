import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SanctionedModule } from './sanctioned/sanctioned.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SanctionedModule, SearchModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SanctionedModule } from './sanctioned/sanctioned.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SanctionedModule],
})
export class AppModule {}

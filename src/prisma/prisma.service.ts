import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';

@Injectable()
export class PrismaService extends PrismaClient{
    constructor(private configService: ConfigService) {
        super({
          datasources: {
            db: {
              url: configService.get('DATABASE_URL'),
            },
          },
        });
        {log: ['query']}
      }
}

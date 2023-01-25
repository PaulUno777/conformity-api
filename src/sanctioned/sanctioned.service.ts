import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SanctionedService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(page?: number): Promise<any> {
    //Elements per page
    const PER_PAGE : number = Number(this.config.get('PER_PAGE'));

    const count: number = await this.prisma.sanctioned.count() | 0;
    const totalPages = count / Number(this.config.get('PER_PAGE'))

    const currentPage: number = Math.max(Number(page) || 1, 1);
    const pageNumber : number= currentPage - 1;

    //get elements with their corresponding sanction
    const sanctionedData = await this.prisma.sanctioned.findMany({
      include: {
        Sanction: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: pageNumber * PER_PAGE,
      take: PER_PAGE,
    });

    return {
      page: pageNumber + 1,
      totalPages: totalPages,
      data: sanctionedData,
    };
  }

  async findOne(id: string) {
    const sanctionedData = await this.prisma.sanctioned.findUnique({
      include: {
        akas: true,
        datesOfBird: true,
        placesOfbird: true,
        nationalities: true,
        citizenships: true,
        Sanction: true,
      },
      where: {
        id: id,
      },
    });
    return {
      data: sanctionedData,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SanctionedService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(page?: number): Promise<any> {
    //Elements per page
    const PER_PAGE = Number(this.config.get('PER_PAGE'));

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageNumber = currentPage - 1;

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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SanctionedService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async findAll(page?: number): Promise<any> {
    //Elements per page
    const PER_PAGE = Number(this.config.get('PER_PAGE')) ?? 20;

    const count: number = (await this.prisma.sanctioned.count()) | 0;

    const currentPage: number = Math.max(Number(page) || 1, 1);
    const pageNumber: number = currentPage - 1;

    const lastPage = Math.ceil(count / PER_PAGE);
    let prev = null;
    let next = null;
    if (currentPage != 1) prev = currentPage - 1;
    if (currentPage != lastPage) next = currentPage + 1;
    //get elements with their corresponding sanction
    const sanctioned = await this.prisma.sanctioned.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        Sanction: true,
      },
      skip: pageNumber * PER_PAGE,
      take: PER_PAGE,
    });

    const cleanSanctioned = sanctioned.map((elt) => {
      return {
        id: elt.id,
        firstName: elt.firstName,
        middleName: elt.middleName,
        lastName: elt.lastName,
        originalName: elt.originalName,
        otherNames: elt.otherNames,
        Sanction: elt.Sanction.name,
      };
    });

    return {
      data: cleanSanctioned,
      meta: {
        total: count,
        lastPage: lastPage,
        currentPage: currentPage,
        perPage: PER_PAGE,
        prev: prev,
        next: next,
      },
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

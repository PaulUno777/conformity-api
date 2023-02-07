import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NationalityService {
  constructor(private prisma: PrismaService){}

  async findAll() {

    const nationalities = await this.prisma.nationalityList.findMany(
      {select: {country: true}}
    );
    //const cleanNationalities = nationalities.filter()
    return {data: nationalities};
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NationalityService {
  constructor(private prisma: PrismaService){}

  async findAll() {

    const nationalities = await this.prisma.nationalityList.findMany(
      {select: {country: true}}
    );
    const cleanNationalities = this.removeDuplicates(nationalities)
    return {data: cleanNationalities};
  }


  removeDuplicates(array: any[]) {
    return array.filter((item, index) => array.indexOf(item) === index)
  }
}

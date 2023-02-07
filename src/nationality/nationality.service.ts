import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NationalityService {
  constructor(private prisma: PrismaService){}

  async findAll() {

    const nationalities = await this.prisma.nationalityList.findMany(
      {
        select: {country: true},
        orderBy: {
          country: 'asc',
        },
      },
    );
    const cleanNationalities = this.removeDuplicates(nationalities)
    return {data: cleanNationalities};
  }


  removeDuplicates(array: any[]) {
    let filtered =[];
    array.forEach((item) => {
      if(!filtered.includes(item.country) && item.country != null){
        filtered.push(item.country);
      }
    });
    return filtered;
  }
}

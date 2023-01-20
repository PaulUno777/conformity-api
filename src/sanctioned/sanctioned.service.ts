import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSanctionedDto } from './dto/update-sanctioned.dto';

@Injectable()
export class SanctionedService {
  constructor(private prisma: PrismaService) {}
  // create(createSanctionedDto: CreateSanctionedDto) {
  //   return 'This action adds a new sanctioned';
  // }

  async findAll(page?: number): Promise<any> {
	//Elements per page
    const PER_PAGE = 20;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageNumber = currentPage - 1;

	//get elements with their corresponding sanction
    const sanctionedData = await this.prisma.sanctioned.findMany({
		include: {
			// _count: {
			// 	select:{
			// 		akas: true,    
			// 		datesOfBird: true,
			// 		placesOfbird: true,
			// 		nationalities: true,
 			// 		citizenships:true,
			// 	}
			// },
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

  // async findOne(id: number) {
  //   const sanctionedData = await this.prisma.sanctioned.findUnique({
  //     include: {
  //         akas: true,
  //         citizenships:true,
  //         datesOfBird: true,
  //         nationalities: true,
  //         placesOfbird: true,
  //         Sanction: true,
  //     },
  //     where: {
  //       id: id,
  //     }
  // })
  //   return {data: sanctionedData};
  // }

  async update(id: string, updateSanctionedDto: UpdateSanctionedDto) {
    const sanctionedData = await this.prisma.sanctioned.update({
      where: {
        id: id,
      },
      data: updateSanctionedDto,
    });
    return sanctionedData;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} sanctioned`;
  // }
}

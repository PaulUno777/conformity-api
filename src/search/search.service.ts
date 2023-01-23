import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(text?: string) {
    if (text) {
      const result = await this.prisma.sanctioned.aggregateRaw({
        pipeline: [
          { $match: {
             $text: { $search: text },
              
            } 
          },
          // {
          //   $project: {
          //     "_id": 1,
          //     "title": 1,
          //     'firstName': 1,
          //     'middleName': 1,
          //     'lastName': 1,
          //     'original_name': 1,
          //     score: { $meta: "searchScore" }
          //   }
          // },
          { $limit: 10 },
        ],
      });

      return result;
    }

    return { message: 'you must provide a query text parameter' };
  }

  //how to implement fuzzy search in mongoDb
}

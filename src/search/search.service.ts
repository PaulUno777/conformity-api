import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchDto } from './dto/search.output.dto';
import { SearchHelper } from './search.helper';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private helper: SearchHelper) { }

  async search(text: string): Promise<SearchDto> {
    if (text) {
      const searchResult: any = await this.prisma.sanctioned.aggregateRaw({
        pipeline: [
          {
            $search: {
              index:'sanctionned_index',
              text: {
                query: text,
                path: [
                  "firstName",
                  "lastName",
                  "middleName",
                  "otherNames",
                  "original_name",
                ],
                fuzzy: {
                  maxEdits: 2,
                },
              },
            }
          },
          {
            $project: {
              "list_id":1,
              "firstName": 1,
              "middleName": 1,
              "lastName": 1,
              "title": 1,
              "type": 1,
              "remark": 1,
              "gender": 1,
              "designation": 1,
              "motive": 1,
              "reference": 1,
              "reference_ue": 1,
              "reference_onu": 1,
              "un_list_type": 1,
              "listed_on": 1,
              "list_type": 1,
              "submitted_by": 1,
              "original_name": 1,
              "otherNames": 1,
              "updatedAt": 1,
              "createdAt": 1,
              score: { $meta: "searchScore" }
            }
          },
          { $limit: 10 },
        ],
      });
      
      const result = await searchResult.map((elt) => {
        const cleanData = this.helper.mapSearch(elt);
        return cleanData;
      })

      return result;
    }

    throw { message: 'you must provide a query text parameter' };
  }

  //how to implement fuzzy search in mongoDb
}

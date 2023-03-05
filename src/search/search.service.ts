import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchHelper } from './search.helper';
import { SearchCompleteDto } from './dto/search.complete.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private helper: SearchHelper,
    private config: ConfigService,
  ) {}

  //========= Simple Search Features ================
  async search(text: string) {
    if (typeof text != 'string')
      throw new BadRequestException('You must provide a text to search');
    //Request query to mongoDB
    //Search in sanctioned collection
    const sanctionedResult: any = await this.prisma.sanctioned.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: 'sanctionned_index',
            text: {
              query: text,
              path: [
                'firstName',
                'lastName',
                'middleName',
                'originalName',
                'otherNames',
              ],
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'SanctionList',
            localField: 'list_id',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 0, name: 1 } }],
            as: 'sanction',
          },
        },
        {
          $lookup: {
            from: 'DateOfBirthList',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, date: 1 } },
            ],
            as: 'dateOfBirth',
          },
        },
        {
          $lookup: {
            from: 'NationalityList',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, country: 1, code: 1 } },
            ],
            as: 'nationality',
          },
        },
        {
          $addFields: {
            searchScore: { $meta: 'searchScore' },
          },
        },
        {
          $setWindowFields: {
            output: {
              searchMaxScore: { $max: '$searchScore' },
            },
          },
        },
        {
          $addFields: {
            searchNormalizedScore: {
              $divide: ['$searchScore', '$searchMaxScore'],
            },
          },
        },
        {
          $match: { searchNormalizedScore: { $gte: 0.5 } },
        },
        {
          $project: {
            firstName: 1,
            middleName: 1,
            lastName: 1,
            original_name: 1,
            otherNames: 1,
            sanction: {
              $arrayElemAt: ['$sanction', 0],
            },
            dateOfBirth: {
              $arrayElemAt: ['$dateOfBirth', 0],
            },
            nationality: {
              $arrayElemAt: ['$nationality', 0],
            },
            initialScore: '$searchScore',
            maxScore: '$searchMaxScore',
            score: '$searchNormalizedScore',
          },
        },
      ],
    });

    //----search in AkaList collection
    const akaResult: any = await this.prisma.akaList.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: 'sanctioned_aka_index',
            text: {
              query: text,
              path: ['firstName', 'lastName', 'middleName'],
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'Sanctioned',
            let: {
              id: '$sanctionnedId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$id'],
                  },
                },
              },
              {
                $project: {
                  list_id: 1,
                  firstName: 1,
                  middleName: 1,
                  lastName: 1,
                  original_name: 1,
                  otherNames: 1,
                },
              },
            ],
            as: 'sanctioned',
          },
        },
        {
          $lookup: {
            from: 'SanctionList',
            localField: 'sanctioned.0.list_id',
            foreignField: '_id',
            as: 'sanction',
            pipeline: [{ $project: { _id: 0, name: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'DateOfBirthList',
            let: { id: '$sanctionnedId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, date: 1 } },
            ],
            as: 'dateOfBirth',
          },
        },
        {
          $lookup: {
            from: 'NationalityList',
            let: {
              id: '$sanctionnedId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, country: 1, code: 1 } },
            ],
            as: 'nationality',
          },
        },
        {
          $addFields: {
            searchScore: { $meta: 'searchScore' },
          },
        },
        {
          $setWindowFields: {
            output: {
              searchMaxScore: { $max: '$searchScore' },
            },
          },
        },
        {
          $addFields: {
            searchNormalizedScore: {
              $divide: ['$searchScore', '$searchMaxScore'],
            },
          },
        },
        {
          $match: { searchNormalizedScore: { $gte: 0.5 } },
        },
        {
          $project: {
            _id: 0,
            entity: {
              $arrayElemAt: ['$sanctioned', 0],
            },
            sanction: {
              $arrayElemAt: ['$sanction', 0],
            },
            dateOfBirth: {
              $arrayElemAt: ['$dateOfBirth', 0],
            },
            nationality: {
              $arrayElemAt: ['$nationality', 0],
            },
            initialScore: '$searchScore',
            maxScore: '$searchMaxScore',
            score: '$searchNormalizedScore',
          },
        },
      ],
    });

    //clean data and map before sending
    const sanctionedClean: any[] = await sanctionedResult.map((elt) => {
      const cleanData = this.helper.mapSanctioned(elt);
      return cleanData;
    });

    const akaClean: any[] = await akaResult.map((elt) => {
      const cleanData = this.helper.mapAka(elt);
      return cleanData;
    });

    //merge sanctioned and aka result into one array and remove duplicate
    const cleanData = await this.helper.cleanSearch(sanctionedClean, akaClean);
    const downloadUrl = this.config.get('DOWNLOAD_URL');
    const excelData = this.helper.mapExcelData(
      cleanData,
      text,
      cleanData.length,
    );

    const file = await this.helper.generateExcel(excelData, text);
    return {
      resultsCount: cleanData.length,
      resultsFile: `${downloadUrl}${file}`,
      results: cleanData,
    };
  }

  //========= Search  Complete Features ================
  async searchComplete(body: SearchCompleteDto) {
    if (typeof body.fullName != 'string')
      throw new BadRequestException('You must provide a name to search');
    //Request query to mongoDB
    //----sanctioned
    const sanctionedResult: any = await this.prisma.sanctioned.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: 'sanctionned_index',
            text: {
              query: body.fullName,
              path: ['firstName', 'lastName', 'middleName', 'otherNames'],
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'SanctionList',
            localField: 'list_id',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 0, name: 1 } }],
            as: 'sanction',
          },
        },
        {
          $lookup: {
            from: 'DateOfBirthList',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, date: 1 } },
            ],
            as: 'dateOfBirth',
          },
        },
        {
          $lookup: {
            from: 'NationalityList',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, country: 1, code: 1 } },
            ],
            as: 'nationality',
          },
        },
        {
          $addFields: {
            searchScore: { $meta: 'searchScore' },
          },
        },
        {
          $setWindowFields: {
            output: {
              searchMaxScore: { $max: '$searchScore' },
            },
          },
        },
        {
          $addFields: {
            searchNormalizedScore: {
              $divide: ['$searchScore', '$searchMaxScore'],
            },
          },
        },
        {
          $match: { searchNormalizedScore: { $gte: 0.5 } },
        },
        {
          $project: {
            firstName: 1,
            middleName: 1,
            lastName: 1,
            original_name: 1,
            otherNames: 1,
            sanction: {
              $arrayElemAt: ['$sanction', 0],
            },
            dateOfBirth: {
              $arrayElemAt: ['$dateOfBirth', 0],
            },
            nationality: {
              $arrayElemAt: ['$nationality', 0],
            },
            initialScore: '$searchScore',
            maxScore: '$searchMaxScore',
            score: '$searchNormalizedScore',
          },
        },
      ],
    });

    //----aka
    const akaResult: any = await this.prisma.akaList.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: 'sanctioned_aka_index',
            text: {
              query: body.fullName,
              path: ['firstName', 'lastName', 'middleName'],
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'Sanctioned',
            let: {
              id: '$sanctionnedId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$id'],
                  },
                },
              },
              {
                $project: {
                  list_id: 1,
                  firstName: 1,
                  middleName: 1,
                  lastName: 1,
                  original_name: 1,
                  otherNames: 1,
                },
              },
            ],
            as: 'sanctioned',
          },
        },
        {
          $lookup: {
            from: 'SanctionList',
            localField: 'sanctioned.0.list_id',
            foreignField: '_id',
            as: 'sanction',
            pipeline: [{ $project: { _id: 0, name: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'DateOfBirthList',
            let: { id: '$sanctionnedId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, date: 1 } },
            ],
            as: 'dateOfBirth',
          },
        },
        {
          $lookup: {
            from: 'NationalityList',
            let: {
              id: '$sanctionnedId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$sanctionnedId', '$$id'],
                  },
                },
              },
              { $project: { _id: 0, country: 1, code: 1 } },
            ],
            as: 'nationality',
          },
        },
        {
          $addFields: {
            searchScore: { $meta: 'searchScore' },
          },
        },
        {
          $setWindowFields: {
            output: {
              searchMaxScore: { $max: '$searchScore' },
            },
          },
        },
        {
          $addFields: {
            searchNormalizedScore: {
              $divide: ['$searchScore', '$searchMaxScore'],
            },
          },
        },
        {
          $match: { searchNormalizedScore: { $gte: 0.5 } },
        },
        {
          $project: {
            _id: 0,
            entity: {
              $arrayElemAt: ['$sanctioned', 0],
            },
            sanction: {
              $arrayElemAt: ['$sanction', 0],
            },
            dateOfBirth: {
              $arrayElemAt: ['$dateOfBirth', 0],
            },
            nationality: {
              $arrayElemAt: ['$nationality', 0],
            },
            initialScore: '$searchScore',
            maxScore: '$searchMaxScore',
            score: '$searchNormalizedScore',
          },
        },
      ],
    });

    // map data
    //----sanctioned
    const sanctionedClean = await sanctionedResult.map((elt) => {
      const cleanData = this.helper.mapSanctioned(elt);
      return cleanData;
    });
    //----aka
    const akaClean: any = await akaResult.map((elt) => {
      const cleanData = this.helper.mapAka(elt);
      return cleanData;
    });
    //merge sanctioned and aka results into one array
    const cleanData = await this.helper.mergeSearch(sanctionedClean, akaClean);
    //apply filters on results
    const filtered = await this.helper.filterCompleteSearch(cleanData, body);

    //ggenerate Excel file
    const downloadUrl = this.config.get('DOWNLOAD_URL');
    const excelData = this.helper.mapExcelData(
      filtered,
      body.fullName,
      filtered.length,
    );

    const file = await this.helper.generateExcel(excelData, body.fullName);
    return {
      resultsCount: filtered.length,
      resultsFile: `${downloadUrl}${file}`,
      results: filtered,
    };
  }
}

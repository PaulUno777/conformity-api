import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchHelper } from './search.helper';
import { SearchCompleteDto } from './dto/search.complete.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private helper: SearchHelper) {}

  //========= Simple Search Features ================
  async search(text: string) {
    if (text) {
      //Search in sanctioned list
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
                  'otherNames',
                  'original_name',
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
            $project: {
              firstName: 1,
              middleName: 1,
              lastName: 1,
              original_name: 1,
              otherNames: 1,
              sanction: {
                $arrayElemAt: ['$sanction', 0],
              },
              score: { $meta: 'searchScore' },
            },
          },
          { $limit: 15 },
        ],
      });

      //Search in aka list
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
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    name: 1,
                  },
                },
              ],
            },
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
              score: {
                $meta: 'searchScore',
              },
            },
          },
          { $limit: 15 },
        ],
      });

      //clean data and map before sending
      const sanctionedClean: any[] = await sanctionedResult.map((elt) => {
        const cleanData = this.helper.mapSanctioned(
          elt,
          sanctionedResult[0].score,
        );
        return cleanData;
      });

      const akaClean: any[] = await akaResult.map((elt) => {
        const cleanData = this.helper.mapAka(elt, akaResult[0].score);
        return cleanData;
      });

      //merge sanctioned and aka result into one array and remove duplicate
      const cleanData = await this.helper.cleanSearch(
        sanctionedClean,
        akaClean,
      );

      return {
        resultsCount: cleanData.length,
        results: cleanData,
      };
    }

    throw { message: 'you must provide a query text parameter' };
  }

  //========= Search  Complete Features ================

  async searchComplete(body: SearchCompleteDto) {
    const sanctionedPipeline = [];
    const akaPipeline = [];
    let filtered: any[];

    if (body.fullName) {
      //push the first stage in the pipeline
      //------- sanctioned ----------
      sanctionedPipeline.push(
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
      );
      //------- akas ---------
      akaPipeline.push(
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
      );

      if (body.dob) {
        //get the DOB joined data in the pipeline
        //----sanctioned
        sanctionedPipeline.push({
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
        });
        //----aka
        akaPipeline.push({
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
        });
      }

      if (body.nationality) {
        //Get the nationality joined data in the pipeline
        //----sanctioned
        sanctionedPipeline.push({
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
              { $project: { _id: 0, country: 1 } },
            ],
            as: 'nationality',
          },
        });
        //----aka
        akaPipeline.push({
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
              { $project: { _id: 0, country: 1 } },
            ],
            as: 'nationality',
          },
        });
      }

      //push project stage to retrieve needed data
      //----sanctioned
      sanctionedPipeline.push(
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
            score: { $meta: 'searchScore' },
          },
        },
        { $limit: 20 },
      );

      akaPipeline.push(
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
            score: { $meta: 'searchScore' },
          },
        },
        { $limit: 20 },
      );

      //Request query to mongoDB
      // //----sanctioned
      const sanctionedResult: any = await this.prisma.sanctioned.aggregateRaw({
        pipeline: sanctionedPipeline,
      });
      //----aka
      const akaResult: any = await this.prisma.akaList.aggregateRaw({
        pipeline: akaPipeline,
      });

      //clean data and map before
      //----sanctioned
      const sanctionedClean = await sanctionedResult.map((elt) => {
        const cleanData = this.helper.mapSanctioned(
          elt,
          sanctionedResult[0].score,
        );
        return cleanData;
      });

      const akaClean: any = await akaResult.map((elt) => {
        const cleanData = this.helper.mapAka(elt, akaResult[0].score);
        return cleanData;
      });

      //merge sanctioned and aka result into one array and remove duplicate
      const cleanData = await this.helper.cleanSearchComplete(
        sanctionedClean,
        akaClean,
      );

      filtered = await this.helper.filterCompleteSearch(cleanData, body);
      return {
        resultsCount: filtered.length,
        results: filtered,
      };
    }

    throw { message: 'incomplete data received' };
  }
}

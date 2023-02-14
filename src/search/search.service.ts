import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchHelper } from './search.helper';
import { SearchCompleteDto } from './dto/search.complete.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private helper: SearchHelper) {}

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

  //Search  Complete Features

  async searchComplete(body: SearchCompleteDto) {
    const sanctionedPipeline = [];
    const akaPipeline = [];
    let filtered: any[];

    let fullName = '';
    if (body.firstName) fullName += body.firstName;
    if (body.middleName) fullName += ' ' + body.middleName;
    if (body.lastName) fullName += ' ' + body.lastName;

    if (fullName != '') {
      //push the first stage in the pipeline
      sanctionedPipeline.push({
        $search: {
          index: 'sanctionned_index',
          text: {
            query: fullName,
            path: ['firstName', 'lastName', 'middleName', 'otherNames'],
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      });

      //push the DOB filter stage in the pipeline
      if (body.dob) {
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
            ],
            as: 'dateOfBirth',
          },
        });
      }

      //push the DOB filter stage in the pipeline
      if (body.nationality) {
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
            ],
            as: 'nationality',
          },
        });
      }
      sanctionedPipeline.push({
        $project: {
          list_id: 1,
          firstName: 1,
          middleName: 1,
          lastName: 1,
          title: 1,
          type: 1,
          remark: 1,
          gender: 1,
          designation: 1,
          motive: 1,
          reference: 1,
          reference_ue: 1,
          reference_onu: 1,
          un_list_type: 1,
          listed_on: 1,
          list_type: 1,
          submitted_by: 1,
          original_name: 1,
          otherNames: 1,
          updatedAt: 1,
          createdAt: 1,
          dateOfBirth: {
            $arrayElemAt: ['$dateOfBirth', 0],
          },
          nationality: {
            $arrayElemAt: ['$nationality', 0],
          },
          score: { $meta: 'searchScore' },
        },
      });
      sanctionedPipeline.push({ $limit: 10 });
      const result: any = await this.prisma.sanctioned.aggregateRaw({
        pipeline: sanctionedPipeline,
      });

      const cleanResult = await result.map((elt) => {
        const cleanData = this.helper.mapSanctioned(elt, result[0].score);
        return cleanData;
      });

      filtered = await this.helper.filterCompleteSearch(cleanResult, body);

      return {
        resultsCount: filtered.length,
        results: filtered,
      };
    }

    if (body.alias && body.alias != '') {
      //push the first stage in the pipeline
      akaPipeline.push(
        {
          $search: {
            index: 'sanctioned_aka_index',
            text: {
              query: body.alias,
              path: ['firstName', 'lastName', 'middleName'],
              fuzzy: {
                maxEdits: 1,
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
            ],
            as: 'sanctioned',
          },
        },
      );

      //push the DOB filter stage in the pipeline
      if (body.dob) {
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
            ],
            as: 'dateOfBirth',
          },
        });
      }

      //push the DOB filter stage in the pipeline
      if (body.nationality) {
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
            ],
            as: 'nationality',
          },
        });
      }
      akaPipeline.push({
        $project: {
          _id: 0,
          data: {
            $arrayElemAt: ['$sanctioned', 0],
          },
          dateOfBirth: {
            $arrayElemAt: ['$dateOfBirth', 0],
          },
          nationality: {
            $arrayElemAt: ['$nationality', 0],
          },
          score: { $meta: 'searchScore' },
        },
      });
      akaPipeline.push({ $limit: 10 });
      const result: any = await this.prisma.akaList.aggregateRaw({
        pipeline: akaPipeline,
      });
      const cleanResult: any = await result.map((elt) => {
        const cleanData = this.helper.mapAka(elt, result[0].score);
        return cleanData;
      });

      filtered = await this.helper.filterCompleteSearch(cleanResult, body);

      return {
        resultsCount: filtered.length,
        results: filtered,
      };
    }

    throw { message: 'incomplete data received' };
  }
}

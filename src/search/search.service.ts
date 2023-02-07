import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SanctionedDto } from './dto/sanctioned.output.dto';
import { SearchHelper } from './search.helper';
import { SearchCompleteDto } from './dto/search.complete.dto';
import { AkaDto } from './dto/alias.output.dto';
import { pipeline } from 'stream';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private helper: SearchHelper) { }

  async search(text: string) {
    if (text) {
      const sanctionedResult: any = await this.prisma.sanctioned.aggregateRaw({
        pipeline: [
          {
            $search: {
              index: 'sanctionned_index',
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
              "list_id": 1,
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

      const akaResult: any = await this.prisma.akaList.aggregateRaw({
        pipeline: [
          {
            $search: {
              index: 'sanctioned_aka_index',
              text: {
                query: text,
                path: [
                  "firstName",
                  "lastName",
                  "middleName",
                ],
                fuzzy: {
                  maxEdits: 2,
                },
              },
            }
          },
          {
            $project: {
              "sanctionnedId": 1,
              "firstName": 1,
              "middleName": 1,
              "lastName": 1,
              "category": 1,
              "type": 1,
              "comment": 1,
              "updatedAt": 1,
              "createdAt": 1,
              score: { $meta: "searchScore" }
            }
          },
          { $limit: 10 },
        ],
      });

      //clean data and map before sending
      const sanctionedClean = await sanctionedResult.map((elt) => {
        const cleanData = this.helper.mapSanctioned(elt);
        return cleanData;
      })

      const akaClean = await akaResult.map((elt) => {
        const cleanData = this.helper.mapAka(elt);
        return cleanData;
      })

      return {
        sanctioned: sanctionedClean,
        alias: akaClean
      };
    }

    throw { message: 'you must provide a query text parameter' };
  }

  async searchComplete(body: SearchCompleteDto) {
    let sanctionedPipeline = [];
    let akaPipeline = [];

    let fullName = '';
    if (body.firstName) fullName += body.firstName;
    if (body.middleName) fullName += (' ' + body.middleName);
    if (body.lastName) fullName += (' ' + body.lastName);

    if (fullName != '') {
      //push the first stage in the pipeline
      sanctionedPipeline.push({
        $search: {
          index: 'sanctionned_index',
          text: {
            query: fullName,
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
      });

      //push the DOB filter stage in the pipeline
      if (body.dob) {
        sanctionedPipeline.push({
            $lookup: {
              from: "DateOfBirthList",
              let: {
                id: "$_id",
              },
              pipeline: [{
                $match: {
                  $expr: {
                    $eq: ["$sanctionnedId", "$$id"],
                  },
                },
              },],
              as: "dateOfBirth",
            }
          });
      }

      //push the DOB filter stage in the pipeline
      if (body.nationality) {
        sanctionedPipeline.push({
          $lookup: {
            from: "NationalityList",
            let: {
              id: "$_id",
            },
            pipeline: [{
              $match: {
                $expr: {
                  $eq: ["$sanctionnedId", "$$id"],
                },
              },
            },],
            as: "nationality",
          }
        });
      }

      sanctionedPipeline.push({ $limit: 10 });
    }

    console.log(sanctionedPipeline);
    const sanctionedResult = await this.prisma.sanctioned.aggregateRaw( {pipeline: sanctionedPipeline})

    return sanctionedResult;
  }
}

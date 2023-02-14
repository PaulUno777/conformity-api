/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SanctionedDto } from './dto/sanctioned.output.dto';

@Injectable()
export class SearchHelper {
  mapSanctioned(result: any, max: number): SanctionedDto {
    const entity = {
      id: result._id.$oid,
      listId: result.list_id.$oid,
      firstName: result.firstName,
      middleName: result.middleName,
      lastName: result.lastName,
      title: result.title,
      type: result.type,
      remark: result.remark,
      gender: result.gender,
      designation: result.designation,
      motive: result.motive,
      reference: result.reference,
      referenceUe: result.reference_ue,
      referenceOnu: result.reference_onu,
      unListType: result.un_list_type,
      listedOn: result.listed_on,
      listType: result.list_type,
      submittedBy: result.submitted_by,
      originalName: result.original_name,
      otherNames: result.otherNames,
      createdAt: result.createdAt.$date,
      updatedAt: result.updatedAt.$date,
    };

    if (result.dateOfBirth != null)
      entity['dateOfBirth'] = result.dateOfBirth.date;
    if (result.nationality != null)
      entity['nationality'] = result.nationality.country;

    const score: number = this.setPercentage(max, result.score);

    return { entity, score };
  }

  mapAka(result: any, max): SanctionedDto {
    const entity = {
      id: result.data._id.$oid,
      listId: result.data.list_id.$oid,
      firstName: result.data.firstName,
      middleName: result.data.middleName,
      lastName: result.data.lastName,
      title: result.data.title,
      type: result.data.type,
      remark: result.data.remark,
      gender: result.data.gender,
      designation: result.data.designation,
      motive: result.data.motive,
      reference: result.data.reference,
      referenceUe: result.data.reference_ue,
      referenceOnu: result.data.reference_onu,
      unListType: result.data.un_list_type,
      listedOn: result.data.listed_on,
      listType: result.data.list_type,
      submittedBy: result.data.submitted_by,
      originalName: result.data.original_name,
      otherNames: result.data.otherNames,
      createdAt: result.data.createdAt.$date,
      updatedAt: result.data.updatedAt.$date,
    };

    if (result.dateOfBirth != null) {
      entity['dateOfBirth'] = result.dateOfBirth.date;
    }

    if (result.nationality != null)
      entity['nationality'] = result.nationality.country;

    const score: number = this.setPercentage(max, result.score);

    return { entity, score };
  }

  async cleanSearch(array1: any[], array2: any[]) {
    const cleanData: any[] = array1.concat(array2);

    await cleanData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    const indexes = [];
    const filtered = [];

    cleanData.forEach(function (item) {
      if (!indexes.includes(item.entity.id)) {
        indexes.push(item.entity.id);
        filtered.push(item);
      }
    });
    return filtered;
  }

  setPercentage(scoreMax: number, score: number): number {
    const data = (score * 100) / scoreMax;
    return Number(data.toFixed(2));
  }

  //Apply nationality and date of birth filters to retrieved data
  async filterCompleteSearch(response: any[], body: any) {
    let filteredData: any[];

    if (body.dob) {
      filteredData = await response.filter((value: any) => {
        if (value.entity.dateOfBirth) {
          return this.compareDate(value.entity.dateOfBirth, body.dob);
        }
      });
      console.log(filteredData);
    }

    if (body.nationality) {
      filteredData = await response.filter((value: any) => {
        if (value.entity.nationality) {
          return this.compareNationality(
            value.entity.nationality,
            body.nationality,
          );
        }
      });
      console.log(filteredData);
    }

    return filteredData;
  }

  compareDate(responseDate: string, bodyDate: string): boolean {
    const resDate = new Date(responseDate).toISOString().slice(0, 10);
    console.log(resDate.includes(bodyDate));
    return resDate.includes(bodyDate);
  }
  compareNationality(
    responseNationality: string,
    bodyNationality: string,
  ): boolean {
    const resNationality = responseNationality.toUpperCase();
    const bodNationality = bodyNationality.toUpperCase();

    console.log(resNationality.includes(bodNationality));
    return resNationality.includes(bodNationality);
  }
}

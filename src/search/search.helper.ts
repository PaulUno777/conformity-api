/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SanctionedDto } from './dto/sanctioned.output.dto';
import * as i18nIsoCountries from 'i18n-iso-countries'

@Injectable()
export class SearchHelper {
  // map sanctioned data into sanctionedDto
  mapSanctioned(result: any, max: number) : SanctionedDto {
    const entity = {
      id: result._id.$oid,
      firstName: result.firstName,
      middleName: result.middleName,
      lastName: result.lastName,
      originalName: result.original_name,
      otherNames: result.otherNames,
      sanction: result.sanction.name
    };

    if (result.dateOfBirth != null)
      entity['dateOfBirth'] = result.dateOfBirth.date;
    if (result.nationality != null)
      entity['nationality'] = result.nationality.country;

    const score: number = this.setPercentage(max, result.score);

    return { entity, score };
  }

  // map aka data into sanctionedDto
  mapAka(result: any, max) : SanctionedDto {
    const entity = {
      id: result.entity._id.$oid,
      firstName: result.entity.firstName,
      middleName: result.entity.middleName,
      lastName: result.entity.lastName,
      originalName: result.entity.original_name,
      otherNames: result.entity.otherNames,
      sanction: result.sanction.name,
    };

    if (result.dateOfBirth != null) {
      entity['dateOfBirth'] = result.dateOfBirth.date;
    }

    if (result.nationality != null)
      entity['nationality'] = result.nationality.country;

    const score: number = this.setPercentage(max, result.score);

    return { entity, score };
  }

  // merge akalist and sanctioned  and remove duplicate data
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

  //transform score into percentage
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

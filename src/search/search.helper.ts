/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SanctionedDto } from './dto/sanctioned.output.dto';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { SearchCompleteDto } from './dto/search.complete.dto';

@Injectable()
export class SearchHelper {
  // map sanctioned data into sanctionedDto
  mapSanctioned(result: any, max: number): SanctionedDto {
    const entity = {
      id: result._id.$oid,
      firstName: result.firstName,
      middleName: result.middleName,
      lastName: result.lastName,
      originalName: result.original_name,
      otherNames: result.otherNames,
      sanction: result.sanction.name,
    };

    if (result.dateOfBirth != null)
      entity['dateOfBirth'] = result.dateOfBirth.date;
    if (result.nationality != null)
      entity['nationality'] = result.nationality.country;

    const score: number = this.setPercentage(max, result.score);

    return { entity, score };
  }

  // map aka data into sanctionedDto
  mapAka(result: any, max): SanctionedDto {
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

    cleanData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
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
  async filterCompleteSearch(response: any[], body: SearchCompleteDto) {
    let filteredData = response;

    if (body.dob) {
      filteredData = response.filter((value: any) => {
        if (value.entity.dateOfBirth) {
          return this.compareDate(value.entity.dateOfBirth, body.dob);
        }
      });
      console.log(filteredData);
    }

    if (body.nationality && body.nationality.length > 0) {
      const nationalities: any = this.getBodyNationalityNames(body.nationality);
      filteredData = response.filter((value: any) => {
        if (value.entity.nationality) {
          for (const element of nationalities) {
            return this.compareNationality(value.entity.nationality, element);
          }
        }
      });
      console.log(filteredData);
    }

    return filteredData;
  }

  getBodyNationalityNames(nationalities: string[]) {
    const result = nationalities.map((elt) => {
      const countryCode = elt.toUpperCase();
      const nameFr = i18nIsoCountries.getName(countryCode, 'fr');
      const nameEn = i18nIsoCountries.getName(countryCode, 'en');
      return {
        nameFR: nameFr,
        nameEn: nameEn,
      };
    });

    return result;
  }

  compareDate(responseDate: string, bodyDate: string): boolean {
    console.log(responseDate);
    const resDate = new Date(responseDate).toISOString().slice(0, 10);
    console.log(resDate);
    return resDate.includes(bodyDate);
  }

  compareNationality(responseNationality: string, eltNationality): boolean {
    const resNationality = responseNationality.toUpperCase();
    const fr = eltNationality.nameFR.toUpperCase();
    const en = eltNationality.nameEn.toUpperCase();

    let result = false;
    if (resNationality.includes(fr) || resNationality.includes(en))
      result = true;
    return result;
  }
}

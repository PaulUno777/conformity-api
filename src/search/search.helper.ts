/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SanctionedDto } from './dto/sanctioned.output.dto';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { SearchCompleteDto } from './dto/search.complete.dto';
import { Workbook } from 'exceljs';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class SearchHelper {
  constructor(private config: ConfigService) {}
  // map sanctioned data into sanctionedDto
  mapSanctioned(result: any): SanctionedDto {
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

    const score: number = this.setPercentage(result.score);

    return { entity, score };
  }

  // map aka data into sanctionedDto
  mapAka(result: any): SanctionedDto {
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

    const score: number = this.setPercentage(result.score);

    return { entity, score };
  }

  // merge akalist and sanctioned  and remove duplicate data
  async cleanSearch(array1: any[], array2: any[]): Promise<any[]> {
    const cleanData: any[] = array1.concat(array2);

    cleanData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    const filtered = this.removeDuplicate(cleanData);
    return filtered;
  }

  // remove duplicate data
  removeDuplicate(data: any[]): any[] {
    const indexes = [];
    const filtered = [];

    if (data.length > 1) {
      data.forEach(function (item) {
        if (!indexes.includes(item.entity.id)) {
          indexes.push(item.entity.id);
          filtered.push(item);
        }
      });
    }
    return filtered;
  }

  // merge akalist and sanctioned
  mergeSearch(array1: any[], array2: any[]) {
    const cleanData: any[] = array1.concat(array2);
    cleanData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    return cleanData;
  }

  //Apply nationality and date of birth filters to retrieved data
  async filterCompleteSearch(response: any[], body: SearchCompleteDto) {
    let filteredData = response;

    if (body.dob) {
      console.log('date filter ---> ');
      const tempData = [];
      let check: boolean;
      response.forEach((value: any) => {
        if (value.entity.dateOfBirth) {
          check = this.checkDate(value.entity.dateOfBirth, body.dob);
          if (check) tempData.push(value);
        }
      });
      filteredData = tempData;
    }

    if (
      body.nationality &&
      body.nationality.length > 0 &&
      body.nationality != null
    ) {
      const nationalities: any = this.getBodyNationalityNames(body.nationality);
      console.log('natinality filter ---> ');
      const tempArray = [];
      filteredData.forEach((value: any) => {
        if (value.entity.nationality) {
          for (const element of nationalities) {
            const test = this.checkNationality(
              value.entity.nationality,
              element,
            );
            if (test) {
              tempArray.push(value);
              break;
            }
          }
        }
      });
      filteredData = tempArray;
    }

    return filteredData;
  }

  //generate excel file and return path
  async generateExcel(searchResult: any[], searchInput: string) {
    const workbook = new Workbook();
    workbook.creator = 'kamix-conformity-service';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Search Result', {
      headerFooter: { firstHeader: 'SCAN REPORT' },
    });
    //create headers
    sheet.columns = [
      { header: 'Search Input', key: 'searchInput', width: 35 },
      { header: 'Results', key: 'result', width: 40 },
      { header: 'Sanctions', key: 'sanction', width: 68 },
      { header: 'Date Of Birth', key: 'dob', width: 12 },
      { header: 'Nationality', key: 'nationality', width: 20 },
      { header: 'Match Rates (%)', key: 'matchRate', width: 15 },
      { header: 'View Links', key: 'link', width: 45 },
      { header: 'Style', key: 'style', hidden: true },
    ];

    sheet.getRow(1).font = {
      name: 'Calibri',
      family: 4,
      size: 11,
      bold: true,
    };

    //add rows
    sheet.addRows(searchResult);

    //styling the worksheet
    sheet.eachRow((row) => {
      row.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      row.getCell('F').alignment = {
        horizontal: 'right',
      };
      // [ 'C', 'G'].map((key) => {
      //   row.getCell(key).alignment = {
      //     horizontal: 'justify',
      //   };
      // });

      if (row.getCell('H').value == 0) {
        ['B', 'C', 'D', 'E', 'F'].forEach((key) => {
          row.getCell(key).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E2EFDA' },
          };
          row.getCell(key).font = {
            color: { argb: '33B050' },
          };
        });
      }
      if (row.getCell('H').value == 1) {
        ['A', 'G'].map((key) => {
          row.getCell(key).border = {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin', color: { argb: 'FFFFFF' } },
          };
        });
        ['B', 'C', 'D', 'E', 'F'].forEach((key) => {
          row.getCell(key).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FCE4D6' },
          };
          row.getCell(key).font = {
            color: { argb: 'FF0056' },
          };
          row.getCell(key).border = {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin', color: { argb: 'FCE4D6' } },
          };
        });
      }
      if (row.getCell('H').value == 3) {
        ['A', 'G'].map((key) => {
          row.getCell(key).border = {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin', color: { argb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { argb: 'FFFFFF' } },
          };
        });
        ['B', 'C', 'D', 'E', 'F'].map((key) => {
          row.getCell(key).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FCE4D6' },
          };
          row.getCell(key).border = {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin', color: { argb: 'FCE4D6' } },
            bottom: { style: 'thin', color: { argb: 'FCE4D6' } },
          };
        });
      }
      row.commit();
    });

    //write the
    const name = `${searchInput}.xlsx`;
    const fileName = name.replace(/\s/g, '');
    const publicDir = this.config.get('FILE_LOCATION');
    const pathToFile = publicDir + fileName;

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    await fs.unlink(pathToFile, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully deleted the file.');
      }
    });

    await workbook.xlsx.writeFile(pathToFile);

    return fileName;
  }

  //clean data
  mapExcelData(array: any[], searchInput: string, resultCount: number): any[] {
    const cleanData = [];

    if (resultCount > 0) {
      let dateOfBirth = null;
      let nationality = null;

      cleanData.push({
        style: 1,
        searchInput: searchInput,
        result: 'Potential match detected',
        matchRate: array[0].score + ' %',
      });
      array.forEach((elt, index) => {
        let name = '';
        if (elt.entity.dateOfBirth) dateOfBirth = elt.entity.dateOfBirth;
        if (elt.entity.nationality) nationality = elt.entity.nationality;

        if (
          elt.entity.firstName ||
          elt.entity.middleName ||
          elt.entity.lastName
        ) {
          if (elt.entity.firstName != null)
            name = name + ' ' + elt.entity.firstName;
          if (elt.entity.middleName != null)
            name = name + ' ' + elt.entity.middleName;
          if (elt.entity.lastName != null)
            name = name + ' ' + elt.entity.lastName;
        } else {
          if (elt.entity.originalName != null) {
            name = name + ' ' + elt.entity.originalName;
          } else {
            for (const value of elt.entity.otherNames) {
              name = name + ' ' + value;
            }
          }
        }

        cleanData.push({
          style: 3,
          result: `${index}. (${elt.score}%) - ${name}`,
          sanction: elt.entity.sanction,
          dob: dateOfBirth,
          nationality: nationality,
          link: `todoByFrontDev/${elt.entity.id}`,
        });
      });
    } else {
      cleanData.push({
        style: 0,
        searchInput: searchInput,
        result: 'No match detected',
        matchRate: '0.00 %',
      });
    }

    return cleanData;
  }

  getBodyNationalityNames(codes: string[]) {
    let result = [];
    codes.map(async (elt) => {
      const countryCode = elt.toUpperCase();
      const nameFr = i18nIsoCountries.getName(countryCode, 'fr');
      const nameEn = i18nIsoCountries.getName(countryCode, 'en');

      let arrayFr = [];
      if (nameFr) arrayFr = this.transfarmName(nameFr);
      let arrayEn;
      if (nameEn) arrayEn = this.transfarmName(nameEn);

      const tempArray = arrayFr.concat(arrayEn);
      result = result.concat(tempArray);
    });

    const filterd = result.filter((elt) => {
      return elt.length > 3;
    });

    return filterd;
  }

  transfarmName(name: string): string[] {
    const tempArray = [];
    if (name.trim().includes(' ')) {
      return name.trim().split(' ');
    } else {
      tempArray.push(name.trim());
      return tempArray;
    }
  }

  checkDate(responseDate, bodyDate: string): boolean {
    let check = false;
    if (bodyDate.includes('-')) {
      const [year, month] = bodyDate.trim().split('-');
      if (responseDate.year == year && responseDate.month == month)
        check = true;
    } else {
      if (responseDate.year == bodyDate.trim()) check = true;
    }
    return check;
  }

  //transform score into percentage
  checkNationality(santionedNationality: string, countryName): boolean {
    const nationality = santionedNationality.toUpperCase();
    const country = countryName.toUpperCase();

    const test = nationality.includes(country) || country.includes(nationality);
    return test;
  }

  //transform score into percentage
  setPercentage( score: number): number {
    const data = score * 100;
    return Number(data.toFixed(2));
  }
}

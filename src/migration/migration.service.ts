import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
const mysql = require('mysql2/promise');

@Injectable()
export class MigrationService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  //=========MySQL connector================
  async mysqlConnect(): Promise<any> {
    //Get the database connection string from dotenv file
    const msqlUrl = await JSON.parse(this.configService.get('MYSQL_URL'));
    //create connection to MySQL
    return await mysql.createConnection(msqlUrl);
  }

  //=======algorithm that transform id of type BigInt to MongoDB ObjectId======
  transformId(id: number): string {
    if (!id) return '';
    let tempId: string;
    let count: number = 0;

    tempId = id.toString();
    const length = 24 - tempId.length;

    for (let i = 0; i < length; i++) {
      if (count > 9) count = 0;
      tempId += count;
      count++;
    }
    return tempId;
  }

  //=========Main method for all migrations================
  async migrateAllToMongo() {
    await this.migrateSantionToMongo();
    await this.migrateSantionedToMongo();
    await this.migratePlaceOfBirthListToMongo();
    await this.migrateDateOfBirthListToMongo();
    await this.migrateNationalityListToMongo();
    await this.migrateCitizenshipListToMongo();
    await this.migrateAkaListToMongo();

    return { message: 'all migrations complete successfully' };
  }

  //===============Method for AkaList migration=============================
  async migrateAkaListToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM aka_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        sanctionnedId: this.transformId(elt.sanctioned_id),
        category: elt.category,
        type: elt.type,
        firstName: elt.firstname,
        middleName: elt.middlename,
        lastName: elt.lastname,
        comment: elt.comment,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.akaList.create({ data: cleanData[0] });

    // // test we have alreading migrate data
    const testData = await this.prisma.akaList.findUnique({
      where: { id: cleanData[1].id },
    });
    if (!testData) {
      let data: any[];
      let result;
      for (let i = 1; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.akaList.createMany({ data: data });
        }
        console.log({
          message: 'AkaList successfully migrated',
          result: result,
        });
      }
      return result;
    }
    return { message: 'the migration has already been done' };
  }

  //===============Method for CitizenshipList migration=============================
  async migrateCitizenshipListToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM nationality_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        sanctionnedId: this.transformId(elt.sanctioned_id),
        country: elt.country,
        code: elt.code,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.citizenshipList.create({ data: cleanData[0] });

    // // test we have alreading migrate data
    const testData = await this.prisma.citizenshipList.findUnique({
      where: { id: cleanData[1].id },
    });
    if (!testData) {
      let data: any[];
      let result;
      for (let i = 1; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.citizenshipList.createMany({ data: data });
        }
        console.log({
          message: 'CitizenshipList successfully migrated',
          result: result,
        });
      }
      return result;
    }
    return { message: 'the migration has already been done' };
  }

  //===============Method for NationalityList migration=============================
  async migrateNationalityListToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM nationality_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        sanctionnedId: this.transformId(elt.sanctioned_id),
        country: elt.country,
        code: elt.code,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.nationalityList.create({ data: cleanData[0] });

    // // test we have alreading migrate data
    const testData = await this.prisma.nationalityList.findUnique({
      where: { id: cleanData[1].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      for (let i = 1; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.nationalityList.createMany({ data: data });
        }
        console.log({
          message: 'NationalityList successfully migrated',
          result: result,
        });
      }
      return result;
    }
    return { message: 'the migration has already been done' };
  }

  //===============Method for DateOfBirthList migration=============================
  async migrateDateOfBirthListToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM date_of_birth_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        sanctionnedId: this.transformId(elt.sanctioned_id),
        date: elt.date,
        comment: elt.comment,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.dateOfBirthList.create({ data: cleanData[0] });

    // // test we have alreading migrate data
    const testData = await this.prisma.dateOfBirthList.findUnique({
      where: { id: cleanData[1].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      for (let i = 1; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.dateOfBirthList.createMany({ data: data });
        }
        console.log({
          message: 'DateOfBirthList successfully migrated',
          result: result,
        });
      }
      return result;
    }
    return { message: 'the migration has already been done' };
  }

  //===============Method for PlaceOfBirthList migration=============================
  async migratePlaceOfBirthListToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM place_of_birth_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        sanctionnedId: this.transformId(elt.sanctioned_id),
        place: elt.place,
        city: elt.city,
        stateOrProvince: elt.state_or_province,
        postalCode: elt.postal_code,
        zipCode: elt.zip_code,
        country: elt.country,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.placeOfBirthList.create({ data: cleanData[0] });
    const data = cleanData.slice(1);

    // // test we have alreading migrate data
    const testData = await this.prisma.placeOfBirthList.findUnique({
      where: { id: cleanData[1].id },
    });

    if (!testData) {
      const result = await this.prisma.placeOfBirthList.createMany({
        data: data,
      });
      console.log({
        message: 'PlaceOfBirthList successfully migrated',
        result: result,
      });
      return result;
    }

    return { message: 'the migration has already been done' };
  }

  //===============Method for sanctioned migration=============================
  async migrateSantionedToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM sanctioned';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      let otherNames = [];
      if (elt.name1 != null) otherNames.push(elt.name1);
      if (elt.name3 != null) otherNames.push(elt.name3);
      if (elt.name2 != null) otherNames.push(elt.name2);
      if (elt.name4 != null) otherNames.push(elt.name4);
      if (elt.name5 != null) otherNames.push(elt.name5);
      if (elt.name6 != null) otherNames.push(elt.name6);
      return {
        id: this.transformId(elt.id),
        listId: this.transformId(elt.list_id),
        firstName: elt.firstname,
        middleName: elt.middlename,
        lastName: elt.lastname,
        title: elt.title,
        type: elt.type,
        remark: elt.remark,
        gender: elt.gender,
        designation: elt.designation,
        motive: elt.motive,
        reference: elt.ref,
        referenceUe: elt.ref_ue,
        referenceOnu: elt.onu,
        unListType: elt.un_list_type,
        listedOn: elt.listed_on,
        listType: elt.list_type,
        submittedBy: elt.submitted_by,
        originalName: elt.original_name,
        otherNames: otherNames,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.sanctioned.create({ data: cleanData[0] });

    // test we have alreading migrate data
    const testData = await this.prisma.sanctioned.findUnique({
      where: { id: cleanData[1].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      for (let i = 1; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.sanctioned.createMany({ data: data });
        }
        console.log({
          message: 'sanctioned successfully migrated',
          result: result,
        });
      }
      return result;
    }

    return { message: 'the migration has already been done' };
  }

  //===============Method for sanctionList migration=============================
  async migrateSantionToMongo() {
    //Get data from MYSQL
    const connection = await this.mysqlConnect();
    const querie = 'SELECT * FROM sanction_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.transformId(elt.id),
        name: elt.name,
        publicationDate: elt.publication_date,
        file: elt.file,
        numberOfLine: elt.number_of_line,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    //push frist data to generate schema
    await this.prisma.sanctionList.create({ data: cleanData[0] });
    const data = cleanData.slice(1);

    // // test we have alreading migrate data
    const testData = await this.prisma.sanctionList.findUnique({
      where: { id: cleanData[1].id },
    });

    if (!testData) {
      const result = await this.prisma.sanctionList.createMany({ data: data });
      console.log({
        message: 'sanctionList successfully migrated',
        result: result,
      });
      return result;
    }

    return { message: 'the migration has already been done' };
  }
}

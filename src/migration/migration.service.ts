import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MigrationHelper } from './migration.helper';

@Injectable()
export class MigrationService {
  constructor(
    private prisma: PrismaService,
    private helper: MigrationHelper
  ) { }

  //=========Main method for all Migrations================
  async migrateAllToMongo() {
    const resSantion = await this.migrateSantionToMongo();
    const resSantioned = await this.migrateSantionedToMongo();
    const resPlace = await this.migratePlaceOfBirthListToMongo();
    const resDate = await this.migrateDateOfBirthListToMongo();
    const resNat = await this.migrateNationalityListToMongo();
    const resCit = await this.migrateCitizenshipListToMongo();
    const resAka = await this.migrateAkaListToMongo();

    return [resSantion, resSantioned, resPlace, resDate, resNat, resCit, resAka];
  }

  //=========Main method for all Updates================
  async updateAllToMongo() {
    const resSantion = await this.updateSantionToMongo();
    const resSantioned = await this.updateSantionedToMongo();
    const resPlace = await this.updatePlaceOfBirthListToMongo();
    const resDate = await this.updateDateOfBirthListToMongo();
    const resNat = await this.updateNationalityListToMongo();
    const resCit = await this.updateCitizenshipListToMongo();
    const resAka = await this.updateAkaListToMongo();

    return [resSantion, resSantioned, resPlace, resDate, resNat, resCit, resAka]
  }


  //==== Method for AkaList =============================
  //------ Make migration --------
  async migrateAkaListToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM aka_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        sanctionnedId: this.helper.transformId(elt.sanctioned_id),
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

    // // test we have alreading migrate data
    const testData = await this.prisma.akaList.findUnique({
      where: { id: cleanData[0].id },
    });
    if (!testData) {
      let data: any[];
      let result;
      let count = 0;
      for (let i = 0; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.akaList.createMany({ data: data });
        }
        count += result;
      }
      return { message: `${count} AkaList element(s) migrated` };
    }
    return { message: 'no AkaList\'s element migrated' };
  }
  //----- Update database -------
  async updateAkaListToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.akaList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM aka_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
      //cleanup data
      const cleanData = await table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          sanctionnedId: this.helper.transformId(elt.sanctioned_id),
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
      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.akaList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} akaList element(s) updated` };
    }
    return { message: 'no akaList\'s element updated' };
  }


  //===== Method for CitizenshipList migration ===========
  //------ Make migration --------
  async migrateCitizenshipListToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM nationality_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        sanctionnedId: this.helper.transformId(elt.sanctioned_id),
        country: elt.country,
        code: elt.code,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    // // test we have alreading migrate data
    const testData = await this.prisma.citizenshipList.findUnique({
      where: { id: cleanData[0].id },
    });

    if (!testData) {
      let data: any[];
      let result;
      let count = 0;
      for (let i = 0; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.citizenshipList.createMany({ data: data });
        }
        count += result;
      }
      return { message: `${count} citizenshipList element(s) migrated` };
    }
    return { message: 'no citizenshipList\'s element migrated' };
  }
  //----- Update database -------
  async updateCitizenshipListToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.citizenshipList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);

    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM nationality_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
      //cleanup data
      const cleanData = table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          sanctionnedId: this.helper.transformId(elt.sanctioned_id),
          country: elt.country,
          code: elt.code,
          mainEntry: elt.main_entry,
          updatedAt: elt.updated_at,
          createdAt: elt.created_at,
        };
      });
      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.citizenshipList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} citizenshipList element(s) updated` };
    }
    return { message: 'no citizenshipList\'s element updated' };
  }


  //==== Method for NationalityList migration ==============
  //------ Make migration --------
  async migrateNationalityListToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM nationality_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        sanctionnedId: this.helper.transformId(elt.sanctioned_id),
        country: elt.country,
        code: elt.code,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    // // test we have alreading migrate data
    const testData = await this.prisma.nationalityList.findUnique({
      where: { id: cleanData[0].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      let count = 0;
      for (let i = 0; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.nationalityList.createMany({ data: data });
        }
        count += result;
      }
      return { message: `${count} nationalityList element(s) migrated` };
    }
    return { message: 'no nationalityList\'s element migrated' };
  }
  //----- Update database -------
  async updateNationalityListToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.nationalityList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);

    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM nationality_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
      //cleanup data
      const cleanData = table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          sanctionnedId: this.helper.transformId(elt.sanctioned_id),
          country: elt.country,
          code: elt.code,
          mainEntry: elt.main_entry,
          updatedAt: elt.updated_at,
          createdAt: elt.created_at,
        };
      });
      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.nationalityList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} nationalityList element(s) updated` };
    }
    return { message: 'no nationalityList\'s element updated' };
  }


  //====== Method for DateOfBirthList migration ==============
  //------ Make migration --------
  async migrateDateOfBirthListToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM date_of_birth_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        sanctionnedId: this.helper.transformId(elt.sanctioned_id),
        date: elt.date,
        comment: elt.comment,
        mainEntry: elt.main_entry,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    // // test we have alreading migrate data
    const testData = await this.prisma.dateOfBirthList.findUnique({
      where: { id: cleanData[0].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      let count = 0;
      for (let i = 0; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.dateOfBirthList.createMany({ data: data });
        }
        count += result;
      }
      return { message: `${count} dateOfBirthList element(s) migrated` };
    }
    return { message: 'no dateOfBirthList\'s element migrated' };
  }
  //----- Update database -------
  async updateDateOfBirthListToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.dateOfBirthList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);

    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM date_of_birth_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.lenght > 0) {
      //cleanup data
      const cleanData = table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          sanctionnedId: this.helper.transformId(elt.sanctioned_id),
          date: elt.date,
          comment: elt.comment,
          mainEntry: elt.main_entry,
          updatedAt: elt.updated_at,
          createdAt: elt.created_at,
        };
      });
      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.dateOfBirthList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} dateOfBirthList element(s) updated` };
    }
    return { message: 'no dateOfBirthList\'s element updated' };
  }


  //===== Method for PlaceOfBirthList migration ================
  //------ Make migration --------
  async migratePlaceOfBirthListToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM place_of_birth_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        sanctionnedId: this.helper.transformId(elt.sanctioned_id),
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


    // // test we have alreading migrate data
    const testData = await this.prisma.placeOfBirthList.findUnique({
      where: { id: cleanData[0].id },
    });

    if (!testData) {
      const result = await this.prisma.placeOfBirthList.createMany({
        data: cleanData,
      });
      return { message: `${result} placeOfBirthList element(s) migrated` };
    }

    return { message: 'no placeOfBirthList\'s element migrated' };
  }
  //----- Update database -------
  async updatePlaceOfBirthListToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.placeOfBirthList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);

    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM place_of_birth_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
      //cleanup data
      const cleanData = table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          sanctionnedId: this.helper.transformId(elt.sanctioned_id),
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

      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.placeOfBirthList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} placeOfBirthList element(s) updated` };
    }
    return { message: 'no placeOfBirthList\'s element updated' };
  }


  //===== Method for sanctioned migration ========================
  //------ Make migration --------
  async migrateSantionedToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
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
        id: this.helper.transformId(elt.id),
        listId: this.helper.transformId(elt.list_id),
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


    // test we have alreading migrate data
    const testData = await this.prisma.sanctioned.findUnique({
      where: { id: cleanData[0].id },
    });

    //push data in data in batches of 1000 to avoid errors and timeouts
    if (!testData) {
      let data: any[];
      let result;
      let count = 0;
      for (let i = 0; i <= cleanData.length; i += 1000) {
        if (i >= cleanData.length) i = cleanData.length;
        data = cleanData.slice(i, i + 1000);
        if (data.length > 0) {
          result = await this.prisma.sanctioned.createMany({ data: data });
        }
        count += result;
      }
      return { message: `${count} sanctioned element(s) migrated` };
    }

    return { message: 'no sanctioned\'s element migrated' };
  }
  //----- Update database -------
  async updateSantionedToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.sanctioned.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM sanctioned WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
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
          id: this.helper.transformId(elt.id),
          listId: this.helper.transformId(elt.list_id),
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
      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.sanctioned.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} sanctioned element(s) updated` };
    }
    return { message: 'no sanctioned\'s element updated' };
  }


  //==== Method for sanctionList migration =========================
  //------ Make migration --------
  async migrateSantionToMongo() {
    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = 'SELECT * FROM sanction_lists';
    const [table] = await connection.execute(querie);
    connection.close();

    //cleanup data
    const cleanData = table.map((elt) => {
      return {
        id: this.helper.transformId(elt.id),
        name: elt.name,
        publicationDate: elt.publication_date,
        file: elt.file,
        numberOfLine: elt.number_of_line,
        updatedAt: elt.updated_at,
        createdAt: elt.created_at,
      };
    });

    // // test we have alreading migrate data
    const testData = await this.prisma.sanctionList.findUnique({
      where: { id: cleanData[0].id },
    });

    if (!testData) {
      const result = await this.prisma.sanctionList.createMany({ data: cleanData });

      return { message: `${result} sanctionList element(s) migrated` };
    }
    return { message: 'no sanctionList\'s element migrated' };
  }
  //----- Update database -------
  async updateSantionToMongo() {
    //Get the last updated element from mongoDB
    const result = await this.prisma.sanctionList.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
    const lastDate = this.helper.transformDate(result.updatedAt);

    //Get data from MYSQL
    const connection = await this.helper.mysqlConnect();
    const querie = `SELECT * FROM sanction_lists WHERE updated_at > '${lastDate}'`;
    const [table] = await connection.execute(querie);
    connection.close();

    if (table.length > 0) {
      //cleanup data
      const cleanData = table.map((elt) => {
        return {
          id: this.helper.transformId(elt.id),
          name: elt.name,
          publicationDate: elt.publication_date,
          file: elt.file,
          numberOfLine: elt.number_of_line,
          updatedAt: elt.updated_at,
          createdAt: elt.created_at,
        };
      });

      //update data in mongo database
      let count = 0
      for (let i = 0; i < cleanData.length; i++) {
        const { id, ...element } = cleanData[i];
        await this.prisma.sanctionList.upsert({
          where: { id: cleanData[i].id },
          update: element,
          create: element,
        });
        count += 1;
      }
      return { message: `${count} sanctionList element(s) updated` };
    }
    return { message: 'no sanctionList\'s element updated' };
  }
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const mysql = require('mysql2/promise');

@Injectable()
export class MigrationHelper {
  constructor(private config: ConfigService) {}

  //=========MySQL connector================
  async mysqlConnect(): Promise<any> {
    //Get the database connection string from dotenv file
    const msqlUrl = await JSON.parse(this.config.get('MYSQL_URL'));
    return await mysql.createConnection(msqlUrl);
  }

  //=======algorithm that transform id of type BigInt to MongoDB ObjectId======
  transformId(id: number): string {
    if (!id) return '';
    let tempId: string;
    let count = 0;

    tempId = id.toString();
    const length = 24 - tempId.length;

    for (let i = 0; i < length; i++) {
      if (count > 9) count = 0;
      tempId += count;
      count++;
    }
    return tempId;
  }

  //Timestamp tranform to string
  transformDate(date: Date): string {
    const TIME_ZONE = Number(this.config.get('TIME_ZONE'));
    date.setTime(date.getTime() + TIME_ZONE * 60 * 60 * 1000);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  //tranform date of birth
  formatDate(date) {
    if (date.length <= 4) {
      const resDate = new Date(date + '-01-01').toISOString().slice(0, 10);
      return resDate;
    }
    if (date.includes('/') || date.includes('-')) {
      
      const reg = /[-/\\]/;
      const tempDate = date.split(reg);

      if (date.length <= 7) {
        if (tempDate[0].length < 3) {
          const dateString = `${tempDate[1]}-${tempDate[0]}-01`
          const resDate = new Date(dateString)
            .toISOString()
            .slice(0, 10);
          return resDate;
        } else {
          const dateString = `${tempDate[0]}-${tempDate[1]}-01`
          const resDate = new Date(dateString)
            .toISOString()
            .slice(0, 10);
          return resDate;
        }
      } else {
        if (tempDate[0].length < 3) {
          const dateString = `${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`
          const resDate = new Date(dateString)
            .toISOString()
            .slice(0, 10);
          return resDate;
        } else {
          const dateString = `${tempDate[0]}-${tempDate[1]}-${tempDate[2]}`
          const resDate = new Date(dateString)
            .toISOString()
            .slice(0, 10);
          return resDate;
        }
      }
    }
  }
}

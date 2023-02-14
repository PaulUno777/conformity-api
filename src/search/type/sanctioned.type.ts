/* eslint-disable prettier/prettier */
export class SanctionedType {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  originalName: string;
  otherNames: Array<string>;
  sanction: string;
  dateOfBirth?: string;
  nationality?: string;
}

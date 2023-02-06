import { Injectable } from "@nestjs/common";
import { AkaDto } from "./dto/alias.output.dto";
import { SanctionedDto } from './dto/sanctioned.output.dto';

@Injectable()
export class SearchHelper {
    mapSanctioned(result: any):SanctionedDto {
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
            updatedAt: result.updatedAt.$date
        }

        const score: number = (result.score);

        return { entity, score };
    }

    mapAka(result: any): AkaDto {
        const entity = {
            id: result._id.$oid,
            sanctionedId: result.sanctionnedId.$oid,
            category: result.category,
            type: result.type,
            firstName: result.firstName,
            middleName: result.middleName,
            lastName: result.lastName,
            comment: result.comment,
            createdAt: result.createdAt.$date,
            updatedAt: result.updatedAt.$date
        }

        const score: number = (result.score);

        return { entity, score };
    }
}
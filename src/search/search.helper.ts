import { Injectable } from "@nestjs/common";
import { SearchDto } from "./dto/search.dto";

@Injectable()
export class SearchHelper {
    mapSearch(result: any): SearchDto {
        const data = {
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

        return { data, score };
    }
}
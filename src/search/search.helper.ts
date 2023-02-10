import { Injectable } from "@nestjs/common";
import { AkaDto } from "./dto/alias.output.dto";
import { SanctionedDto } from './dto/sanctioned.output.dto';

@Injectable()
export class SearchHelper {
    mapSanctioned(result: any): SanctionedDto {
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

        if(result.dateOfBirth != null) entity["dateOfBirth"] = result.dateOfBirth.date
        if(result.nationality != null) entity["nationality"] = result.nationality.country

        const score: number = (result.score);

        return { entity, score };
    }

    mapAka(result: any): SanctionedDto {
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
            updatedAt: result.data.updatedAt.$date
        }

        

        const score: number = (result.score);

        return { entity, score };
    }

    async cleanSearch(array1: any[], array2: any[]){
        let cleanData: any[] = array1.concat(array2)

        await cleanData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
        let indexes =[];
        let filtered = [];
        
        cleanData.forEach(function(item){ 
            if(!indexes.includes(item.entity.id)){
                indexes.push(item.entity.id);
                filtered.push(item);
            }
        });
        return filtered;
    }
}


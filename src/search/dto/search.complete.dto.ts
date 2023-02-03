import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchCompleteDto {
    @ApiProperty()
    firstName: string;

    @ApiPropertyOptional()
    middleName?: string;

    @ApiProperty()
    lastName: string;

    @ApiPropertyOptional()
    alias?: string;

    @ApiPropertyOptional()
    dob?: string;

    @ApiPropertyOptional()
    nationality?: string;
}
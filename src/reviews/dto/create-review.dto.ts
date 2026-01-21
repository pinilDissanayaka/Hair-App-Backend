import { IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsNumber()
    salonId: number;

    @IsOptional()
    @IsNumber()
    bookingId?: number;

    @IsOptional()
    @IsNumber()
    staffId?: number;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @IsArray()
    images?: string[];

    @IsOptional()
    detailedRatings?: {
        service?: number;
        cleanliness?: number;
        value?: number;
        staff?: number;
    };
}

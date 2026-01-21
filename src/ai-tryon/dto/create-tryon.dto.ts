import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTryOnDto {
    @IsString()
    originalImageUrl: string; // Base64 or URL to uploaded image

    @IsNumber()
    hairstyleId: number;

    @IsOptional()
    @IsString()
    hairstyleName?: string;
}

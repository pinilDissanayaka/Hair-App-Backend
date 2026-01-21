import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsObject, IsNumber, IsBoolean, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';
import { SalonGenderSpecialization } from '../entities/salon.entity';

export class CreateSalonDto {
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    businessName: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @MinLength(10)
    phone: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsEnum(SalonGenderSpecialization)
    genderSpecialization: SalonGenderSpecialization;

    @IsOptional()
    @IsArray()
    languagesSpoken?: string[];

    @IsObject()
    workingHours: {
        monday?: { open: string; close: string; closed?: boolean };
        tuesday?: { open: string; close: string; closed?: boolean };
        wednesday?: { open: string; close: string; closed?: boolean };
        thursday?: { open: string; close: string; closed?: boolean };
        friday?: { open: string; close: string; closed?: boolean };
        saturday?: { open: string; close: string; closed?: boolean };
        sunday?: { open: string; close: string; closed?: boolean };
    };

    @IsOptional()
    @IsString()
    businessRegistrationNumber?: string;

    @IsOptional()
    @IsBoolean()
    acceptsWalkIns?: boolean;

    @IsOptional()
    @IsBoolean()
    acceptsOnlineBookings?: boolean;
}

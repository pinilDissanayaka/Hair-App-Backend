import { IsNumber, IsString, IsOptional, IsArray, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsNumber()
    salonId: number;

    @IsNumber()
    serviceId: number;

    @IsOptional()
    @IsNumber()
    staffId?: number;

    @Type(() => Date)
    @IsDate()
    appointmentDate: Date;

    @IsString()
    appointmentTime: string; // HH:MM format

    @IsOptional()
    @IsArray()
    selectedAddOns?: string[];

    @IsOptional()
    @IsString()
    customerNotes?: string;

    @IsOptional()
    @IsString()
    paymentMethod?: string;
}

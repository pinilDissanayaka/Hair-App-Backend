import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Service } from '../salons/entities/service.entity';
import { Staff } from '../salons/entities/staff.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Booking, Service, Staff])],
    controllers: [BookingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule {}

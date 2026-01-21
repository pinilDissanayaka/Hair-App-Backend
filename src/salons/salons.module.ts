import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalonsService } from './salons.service';
import { SalonsController } from './salons.controller';
import { Salon } from './entities/salon.entity';
import { Service } from './entities/service.entity';
import { Staff } from './entities/staff.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Salon, Service, Staff])],
    controllers: [SalonsController],
    providers: [SalonsService],
    exports: [SalonsService],
})
export class SalonsModule {}

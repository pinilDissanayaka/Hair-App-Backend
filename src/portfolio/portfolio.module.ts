import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Portfolio])],
    exports: [TypeOrmModule],
})
export class PortfolioModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTryonService } from './ai-tryon.service';
import { AiTryonController } from './ai-tryon.controller';
import { TryOnSession } from './entities/tryon-session.entity';
import { Hairstyle } from './entities/hairstyle.entity';
import { CustomerProfile } from '../users/entities/customer-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TryOnSession, Hairstyle, CustomerProfile])],
    controllers: [AiTryonController],
    providers: [AiTryonService],
    exports: [AiTryonService],
})
export class AiTryonModule {}

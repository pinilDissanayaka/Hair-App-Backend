import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles-guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    ThrottlerModule,
    // this will make the post repository available for injection
    //available in the current
    //scope
    TypeOrmModule.forFeature([User]),

    //passport module
    PassportModule,

    //configure JWT
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}

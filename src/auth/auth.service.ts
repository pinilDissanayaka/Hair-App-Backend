import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { hashPassword, comparePassword } from 'src/utils/cyper.utils';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PassThrough } from 'stream';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }


    async register(registerDto: RegisterDto) {
        const userExists = await this.usersService.getUserByEmail(registerDto.email);

        if (userExists) {
            throw new ConflictException('User with this email already exists');
        }

        hashPassword(registerDto.password).then(async hashedPwd => {
            registerDto.password = hashedPwd;
            await this.usersService.createUser(registerDto);
        });

        const { password, ...result } = registerDto;

        return {
            message: 'User registered successfully, please login',
            user: result,
        };
    }


    async login(loginDto: LoginDto) {

        const existingUser = await this.usersService.getUserByEmail(loginDto.email);

        if (!existingUser) {
            throw new ConflictException('Invalid credentials');
        }

        if (await comparePassword(loginDto.password, existingUser.password)) {
            const { password, ...result } = existingUser;

            return {
                message: 'Login successful',
                user: result,
                ...await this.generateJwtToken(result)
            };
        };
        throw new ConflictException('Invalid credentials');
    }


    private async generateJwtToken(user: Partial<User>) {
        return {
            accessToken: await this.generateAccessToken(user),
            refreshToken: await this.generateRefreshToken(user)
        }
    };


    



    private generateAccessToken(user: Partial<User>): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };

        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET
        });
    };


    private generateRefreshToken(user: Partial<User>) {
        const payload = {
            sub: user.id
        };

        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET
        });
    };

}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '../utils/cyper.utils';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService : UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.getUserByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException(
        'Email already in use! Please try with a diff email',
      );
    }

    const hashedPassword = await hashPassword(registerDto.password);

    registerDto.password = hashedPassword;

    const newlyCreatedUser = await this.usersService.createUser(registerDto);


    const { password, ...result } = newlyCreatedUser;
    return {
      user: result,
      message: 'Registration successfully! Please login to continue',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.getUserByEmail(loginDto.email);

    if (
      !user ||
      !(await verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or account not exists',
      );
    }

    //generate the tokens
    const tokens = this.generateTokens(user);
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET as string,
      });

      const user = await this.usersService.getUserById(payload.id);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const acccessToken = this.generateAccessToken(user);

      return { acccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  //   Find the current user by ID

  async getUserById(userId: number) {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    const { password, ...result } = user;

    return result;
  }


  private generateTokens(user: User) {
    return {
      acccessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    // -> email , sub (id), role -> vvvI -> RBAC -> user ? Admin ?
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET as string,
      expiresIn: "15m",
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "7d",
    });
  }
}

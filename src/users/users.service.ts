import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
    ) {}


    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id : id } });
    }



    async createUser(userData: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }
}

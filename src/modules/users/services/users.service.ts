import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import { UserResponse } from '../interfaces/user.interface';
import logger from '../../../commom/logs/logger';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;
  
    const userExists = await this.usersRepository.findOne({ where: { email } });
    if (userExists) {
      logger.error(`User already exists: ${email}`);
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  
    await this.usersRepository.save(user);

    logger.info(`User created successfully: ${email}`);

    return instanceToPlain(user) as User;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    logger.info(`Fetching user by email: ${email}`);  
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | null> {
    logger.info(`Fetching user by ID: ${id}`); 
    return this.usersRepository.findOne({ where: { id } });
  }

  async deposit(userId: number, amount: number): Promise<UserResponse> {
    logger.info(`Deposit request for user ID: ${userId}, amount: ${amount}`); 

    const user = await this.findOneById(userId);
  
    if (!user) {
      logger.error(`User not found for deposit: ${userId}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    if (amount <= 0) {
      logger.error(`Invalid deposit amount: ${amount} for user: ${userId}`);
      throw new HttpException('Deposit amount must be greater than 0', HttpStatus.BAD_REQUEST);
    }
  
    user.balance = parseFloat(user.balance.toString()) + amount;
  
    await this.usersRepository.save(user);
  
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
    };
  
    logger.info(`Deposit successful for user ID: ${userId}, new balance: ${user.balance}`);

    return userResponse;
  }

  async getBalance(userId: number): Promise<number> {
    logger.info(`Fetching balance for user ID: ${userId}`);

    const user = await this.findOneById(userId);
  
    if (!user) {
      logger.error(`User not found for balance check: ${userId}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    logger.info(`Balance fetched for user ID: ${userId}, balance: ${user.balance}`);

    return user.balance;
  }
}

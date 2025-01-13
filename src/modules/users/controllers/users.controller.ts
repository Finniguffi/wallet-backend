import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { Public } from 'src/commom/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Public()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Post('deposit')
  async deposit(@Body() depositDto: { userId: number; amount: number }) {
    const { userId, amount } = depositDto;
    return this.usersService.deposit(userId, amount);
  }

  @Get(':userId/balance')
  async getBalance(@Param('userId') userId: number) {
    const balance = await this.usersService.getBalance(userId);
    return { balance };
  }
}
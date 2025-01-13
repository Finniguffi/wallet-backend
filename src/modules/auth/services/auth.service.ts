import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import logger from '../../../commom/logs/logger';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    logger.info(`Login attempt for email: ${email}`);  
    
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user) {
      logger.warn(`User not found for email: ${email}`);  
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for email: ${email}`);  
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const payload = { email: user.email, sub: user.id };
    logger.info(`Login successful for email: ${email}`);  
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

import { Module } from '@nestjs/common';
import { TransactionsController } from './controlllers/transactions.controller';
import { TransactionsService } from './services/transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, User]),
        UsersModule
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService],
})
export class TransactionsModule { }

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { UsersService } from '../../users/services/users.service';
import { TransactionStatus } from '../../../utils/enums/transaction-status.enum';
import { TransactionSummary } from '../interfaces/transaction-summary.interface';
import logger from '../../../commom/logs/logger';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async transfer(senderId: number, receiverId: number, amount: number): Promise<Transaction> {
    if (amount <= 0) {
      logger.error(`Transfer attempt with invalid amount: ${amount}`);
      throw new HttpException('Transfer amount must be greater than zero', HttpStatus.BAD_REQUEST);
    }

    return this.dataSource.transaction(async (manager) => {
      const sender = await this.usersService.findOneById(senderId);
      const receiver = await this.usersService.findOneById(receiverId);

      if (!sender) {
        logger.error(`Sender not found: ${senderId}`);
        throw new HttpException('Sender not found', HttpStatus.NOT_FOUND);
      }

      if (!receiver) {
        logger.error(`Receiver not found: ${receiverId}`);
        throw new HttpException('Receiver not found', HttpStatus.NOT_FOUND);
      }

      if (sender.balance < amount) {
        logger.warn(`Insufficient balance for sender: ${senderId}, current balance: ${sender.balance}`);
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      sender.balance -= amount;
      receiver.balance += amount;

      await manager.save(User, sender);
      await manager.save(User, receiver);

      const transaction = manager.create(Transaction, {
        sender: { id: senderId },
        receiver: { id: receiverId },
        amount,
        status: TransactionStatus.COMPLETED,
        createdAt: new Date(),
      });

      logger.info(`Transaction completed successfully: ${transaction.id}, amount: ${amount}, from: ${senderId} to: ${receiverId}`);  // Log para transação concluída

      return manager.save(Transaction, transaction);
    });
  }

  async reverseTransaction(transactionId: number): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await this.transactionsRepository.findOne({
        where: { id: transactionId },
        relations: ['sender', 'receiver'],
      });

      if (!transaction) {
        logger.error(`Transaction not found: ${transactionId}`);
        throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      }

      if (transaction.status !== TransactionStatus.COMPLETED) {
        logger.error(`Transaction reversal attempted on non-completed transaction: ${transactionId}`);
        throw new HttpException('Only completed transactions can be reversed', HttpStatus.BAD_REQUEST);
      }

      transaction.sender.balance += transaction.amount;
      transaction.receiver.balance -= transaction.amount;

      if (transaction.receiver.balance < 0) {
        logger.error(`Receiver balance would be negative after reversal: ${transactionId}`); 
        throw new HttpException('Receiver balance cannot be negative after reversal', HttpStatus.BAD_REQUEST);
      }

      await manager.save(User, transaction.sender);
      await manager.save(User, transaction.receiver);

      transaction.status = TransactionStatus.REVERSED;
      logger.info(`Transaction reversed successfully: ${transactionId}`);

      return manager.save(Transaction, transaction);
    });
  }

  async getUserTransactions(userId: number): Promise<TransactionSummary[]> {
    logger.info(`Fetching transactions for user: ${userId}`);

    const transactions = await this.transactionsRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
    });
  
    return transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
      sender: {
        id: transaction.sender.id,
        email: transaction.sender.email,
        name: transaction.sender.name,
      },
      receiver: {
        id: transaction.receiver.id,
        email: transaction.receiver.email,
        name: transaction.receiver.name,
      },
    }));
  }
}

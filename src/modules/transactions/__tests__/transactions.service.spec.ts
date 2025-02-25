import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../services/transactions.service';
import { UsersService } from '../../users/services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionStatus } from '../../../utils/enums/transaction-status.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let usersService: UsersService;
  let transactionsRepository: Repository<Transaction>;
  let usersRepository: Repository<User>;

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockTransactionsRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const mockUsersRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEntityManager = {
    save: jest.fn(),
    create: jest.fn().mockImplementation((entity, data) => Object.assign(new entity(), data)), // Mock do método create
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)), // Mock do transaction
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    usersService = module.get<UsersService>(UsersService);
    transactionsRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('transfer', () => {
    it('should throw error if transfer amount is less than or equal to 0', async () => {
      await expect(service.transfer(1, 2, 0)).rejects.toThrow(
        new HttpException('Transfer amount must be greater than zero', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw error if sender does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValueOnce(null);
      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        new HttpException('Sender not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if receiver does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, balance: 200 } as User);
      mockUsersService.findOneById.mockResolvedValueOnce(null);
      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        new HttpException('Receiver not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if sender has insufficient balance', async () => {
      mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, balance: 50 } as User);
      mockUsersService.findOneById.mockResolvedValueOnce({ id: 2, balance: 100 } as User);
      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST),
      );
    });

    describe('reverseTransaction', () => {
      it('should throw error if transaction not found', async () => {
        mockTransactionsRepository.findOne.mockResolvedValueOnce(null);
        await expect(service.reverseTransaction(1)).rejects.toThrow(
          new HttpException('Transaction not found', HttpStatus.NOT_FOUND),
        );
      });

      it('should throw error if transaction is not completed', async () => {
        mockTransactionsRepository.findOne.mockResolvedValueOnce({
          status: TransactionStatus.PENDING,
        } as Transaction);
        await expect(service.reverseTransaction(1)).rejects.toThrow(
          new HttpException('Only completed transactions can be reversed', HttpStatus.BAD_REQUEST),
        );
      });

      describe('getUserTransactions', () => {
        it('should return an array of transaction summaries', async () => {
          const transactions = [
            {
              id: 1,
              amount: 100,
              status: TransactionStatus.COMPLETED,
              createdAt: new Date(),
              sender: { id: 1, email: 'sender@test.com', name: 'Sender' } as User,
              receiver: { id: 2, email: 'receiver@test.com', name: 'Receiver' } as User,
            },
          ];
          mockTransactionsRepository.find.mockResolvedValueOnce(transactions);

          const result = await service.getUserTransactions(1);
          expect(result).toHaveLength(1);
          expect(result[0]).toHaveProperty('id');
        });
      });
    });
  });
});

import { Controller, Post, Body, Param, Put, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { TransactionSummary } from '../interfaces/transaction-summary.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  async transfer(@Body() transferDto: { senderId: number, receiverId: number, amount: number }) {
    return this.transactionsService.transfer(
      transferDto.senderId,
      transferDto.receiverId,
      transferDto.amount
    );
  }

  @Put('reverse/:id')
  async reverse(@Param('id') id: number) {
    return this.transactionsService.reverseTransaction(id);
  }

  @Get(':userId')
  async getTransactions(@Param('userId') userId: number): Promise<TransactionSummary[]> {
    const transactions = await this.transactionsService.getUserTransactions(userId);
    if (!transactions || transactions.length === 0) {
      throw new NotFoundException('No transactions found for this user');
    }
    return transactions;
  }
}

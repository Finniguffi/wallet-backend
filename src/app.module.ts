import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DataSource } from 'typeorm';
import { Transaction } from './modules/transactions/entities/transaction.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';  // Importando o JwtAuthGuard
import { PrometheusModule } from './modules/prometheus/prometheus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST') ?? 'localhost',  
        port: parseInt(configService.get('DB_PORT') ?? '3306', 10),  
        username: configService.get('DB_USERNAME') ?? 'user',  
        password: configService.get('DB_PASSWORD') ?? 'password', 
        database: configService.get('DB_DATABASE') ?? 'wallet',  
        entities: [Transaction, User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
    PrometheusModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

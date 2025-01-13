import { UserResponse } from "src/modules/users/interfaces/user.interface";

export interface TransactionSummary {
    id: number;
    amount: number;
    status: string;
    createdAt: Date;
    sender: Omit<UserResponse, 'balance'>;
    receiver: Omit<UserResponse, 'balance'>;
  }
  

export type TransactionType = 'INCOME' | 'EXPENSE' | 'LOAN_GIVEN' | 'LOAN_TAKEN' | 'BOCA_PURCHASE';
export type PaymentMethod = 'DEBIT' | 'CREDIT' | 'CASH' | 'PIX';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  password?: string;
  monthlyGoal?: number;
}

export interface CreditCard {
  id: string;
  bank: string;
  limit: number;
  availableCredit: number;
  dueDay: number; 
  closingDay: number; 
  color: string;
  isActive: boolean;
  type: 'CREDIT' | 'DEBIT';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE' | 'SPECIAL';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'ALERT' | 'INSIGHT' | 'REMINDER';
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; 
  type: TransactionType;
  category: string;
  date: string; 
  time: string;
  timestamp: number;
  installmentsCount?: number;
  currentInstallment?: number;
  cardId?: string; 
  paymentMethod: PaymentMethod;
  paymentDate?: string; 
  personName?: string; 
  isSpecialOperation?: boolean;
}

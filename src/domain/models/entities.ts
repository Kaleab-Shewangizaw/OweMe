export type TransactionType = 'lent' | 'borrowed';
export type TransactionStatus = 'active' | 'settled';

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Person {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  personId: string;
  amount: number;
  date: string;
  dueDate?: string;
  note?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerData {
  persons: Person[];
  transactions: Transaction[];
}

export interface TransactionInput {
  type: TransactionType;
  personName: string;
  amount: number;
  date: string;
  dueDate?: string;
  note?: string;
}

export interface TransactionUpdate {
  type?: TransactionType;
  personName?: string;
  amount?: number;
  date?: string;
  dueDate?: string;
  note?: string;
  status?: TransactionStatus;
}

export interface DashboardSummary {
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
}

export interface PersonSummary {
  person: Person;
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
  transactionCount: number;
  activeTransactionCount: number;
}

export interface InsightSummary {
  frequentBorrowers: PersonSummary[];
  upcomingDueTransactions: Transaction[];
  overdueTransactions: Transaction[];
}

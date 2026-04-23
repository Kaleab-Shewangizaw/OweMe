export type TransactionType = 'lent' | 'borrowed';
export type TransactionStatus = 'active' | 'settled';

export type TransactionCategory = 'food' | 'shopping' | 'travel' | 'rent' | 'other';


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
  category: TransactionCategory;
  personId: string;
  amount: number;
  date: string;
  dueDate?: string;
  note?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}


export interface UserPreferences {
  pin?: string;
  isSetupComplete: boolean;
  biometricsEnabled: boolean;
  name?: string;
  email?: string;
}

export interface LedgerData {
  persons: Person[];
  transactions: Transaction[];
  preferences: UserPreferences;
}


export interface TransactionInput {
  type: TransactionType;
  category: TransactionCategory;
  personName: string;
  amount: number;
  date: string;
  dueDate?: string;
  note?: string;
}


export interface TransactionUpdate {
  type?: TransactionType;
  category?: TransactionCategory;
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
  historicalBalance: { date: string; balance: number }[];
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

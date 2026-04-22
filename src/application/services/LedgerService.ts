import {
  DashboardSummary,
  InsightSummary,
  LedgerData,
  Person,
  PersonSummary,
  Transaction,
  TransactionInput,
  TransactionUpdate,
} from '../../domain/models/entities';
import { LedgerRepository } from '../../domain/repositories/LedgerRepository';
import { daysUntil } from '../../shared/utils/date';
import { createId } from '../../shared/utils/id';

const FREQUENT_BORROWER_THRESHOLD = 2;
const UPCOMING_DUE_DAYS = 7;

export class LedgerService {
  constructor(private readonly repository: LedgerRepository) {}

  async getLedgerData(): Promise<LedgerData> {
    return this.repository.getLedgerData();
  }

  async addTransaction(input: TransactionInput): Promise<LedgerData> {
    const data = await this.repository.getLedgerData();
    const now = new Date().toISOString();
    const person = this.findOrCreatePersonByName(data, input.personName, now);

    const transaction: Transaction = {
      id: createId(),
      type: input.type,
      category: input.category || 'other',
      personId: person.id,
      amount: Number(input.amount),
      date: input.date,
      dueDate: input.dueDate || undefined,
      note: input.note?.trim() || undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };


    const nextData: LedgerData = {
      ...data,
      transactions: [transaction, ...data.transactions],
    };

    await this.repository.saveLedgerData(nextData);
    return nextData;
  }

  async updateTransaction(id: string, update: TransactionUpdate): Promise<LedgerData> {
    const data = await this.repository.getLedgerData();
    const transaction = data.transactions.find((item) => item.id === id);

    if (!transaction) {
      return data;
    }

    let nextPersonId = transaction.personId;
    if (update.personName && update.personName.trim()) {
      const person = this.findOrCreatePersonByName(data, update.personName, new Date().toISOString());
      nextPersonId = person.id;
    }

    const updatedAt = new Date().toISOString();

    const nextTransactions = data.transactions.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        type: update.type ?? item.type,
        category: update.category ?? item.category,
        personId: nextPersonId,
        amount: update.amount ?? item.amount,
        date: update.date ?? item.date,
        dueDate: update.dueDate === '' ? undefined : (update.dueDate ?? item.dueDate),
        note: update.note === '' ? undefined : (update.note ?? item.note),
        status: update.status ?? item.status,
        updatedAt,
      };

    });

    const nextData: LedgerData = {
      ...data,
      transactions: nextTransactions,
    };

    await this.repository.saveLedgerData(nextData);
    return nextData;
  }

  async deleteTransaction(id: string): Promise<LedgerData> {
    const data = await this.repository.getLedgerData();
    const nextData: LedgerData = {
      ...data,
      transactions: data.transactions.filter((item) => item.id !== id),
    };

    await this.repository.saveLedgerData(nextData);
    return nextData;
  }

  async markAsSettled(id: string): Promise<LedgerData> {
    return this.updateTransaction(id, { status: 'settled' });
  }

  getDashboardSummary(data: LedgerData): DashboardSummary {
    const historicalBalance: { date: string; balance: number }[] = [];
    let runningBalance = 0;

    // Use active transactions only for summary, sorted by date
    const activeSorted = [...data.transactions]
      .filter(t => t.status === 'active')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const summary = activeSorted.reduce(
      (acc, transaction) => {
        if (transaction.type === 'lent') {
          acc.totalLent += transaction.amount;
          runningBalance += transaction.amount;
        } else {
          acc.totalBorrowed += transaction.amount;
          runningBalance -= transaction.amount;
        }

        // Add to historical points (simplify by grouping by date if needed, but for now just points)
        historicalBalance.push({ date: transaction.date, balance: runningBalance });

        acc.netBalance = acc.totalLent - acc.totalBorrowed;
        return acc;
      },
      {
        totalLent: 0,
        totalBorrowed: 0,
        netBalance: 0,
      }
    );

    return {
      ...summary,
      historicalBalance,
    };
  }


  getPersonSummaries(data: LedgerData): PersonSummary[] {
    const byPerson = new Map<string, Transaction[]>();

    for (const transaction of data.transactions) {
      const existing = byPerson.get(transaction.personId) ?? [];
      existing.push(transaction);
      byPerson.set(transaction.personId, existing);
    }

    const summaries = data.persons.map((person) => {
      const transactions = byPerson.get(person.id) ?? [];
      const totals = transactions.reduce(
        (acc, transaction) => {
          if (transaction.status !== 'active') {
            return acc;
          }

          if (transaction.type === 'lent') {
            acc.totalLent += transaction.amount;
          } else {
            acc.totalBorrowed += transaction.amount;
          }
          return acc;
        },
        { totalLent: 0, totalBorrowed: 0 }
      );

      const activeTransactionCount = transactions.filter((item) => item.status === 'active').length;

      return {
        person,
        totalLent: totals.totalLent,
        totalBorrowed: totals.totalBorrowed,
        netBalance: totals.totalLent - totals.totalBorrowed,
        transactionCount: transactions.length,
        activeTransactionCount,
      };
    });

    return summaries.sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));
  }

  getTransactionsByPerson(data: LedgerData, personId: string): Transaction[] {
    return data.transactions
      .filter((item) => item.personId === personId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getInsights(data: LedgerData): InsightSummary {
    const personSummaries = this.getPersonSummaries(data);
    const frequentBorrowers = personSummaries
      .filter((summary) => summary.totalLent > 0 && summary.transactionCount >= FREQUENT_BORROWER_THRESHOLD)
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    const activeWithDueDate = data.transactions.filter((transaction) => {
      return transaction.status === 'active' && Boolean(transaction.dueDate);
    });

    const upcomingDueTransactions = activeWithDueDate
      .filter((transaction) => {
        const remaining = daysUntil(transaction.dueDate as string);
        return remaining >= 0 && remaining <= UPCOMING_DUE_DAYS;
      })
      .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());

    const overdueTransactions = activeWithDueDate
      .filter((transaction) => daysUntil(transaction.dueDate as string) < 0)
      .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());

    return {
      frequentBorrowers,
      upcomingDueTransactions,
      overdueTransactions,
    };
  }

  private findOrCreatePersonByName(data: LedgerData, personName: string, now: string): Person {
    const normalizedName = personName.trim();
    const existing = data.persons.find((person) => {
      return person.name.toLowerCase() === normalizedName.toLowerCase();
    });

    if (existing) {
      return existing;
    }

    const person: Person = {
      id: createId(),
      name: normalizedName,
      createdAt: now,
      updatedAt: now,
    };

    data.persons = [person, ...data.persons];
    return person;
  }
}

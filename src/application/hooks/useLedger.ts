import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  InsightSummary,
  LedgerData,
  Person,
  PersonSummary,
  Transaction,
  TransactionInput,
  TransactionUpdate,
  UserPreferences,
} from '../../domain/models/entities';
import { LocalLedgerRepository } from '../../data/repositories/LocalLedgerRepository';
import { AsyncStorageClient } from '../../data/storage/AsyncStorageClient';
import { LedgerService } from '../services/LedgerService';

const repository = new LocalLedgerRepository(new AsyncStorageClient());
const service = new LedgerService(repository);

const EMPTY_DATA: LedgerData = {
  persons: [],
  transactions: [],
  preferences: {
    isSetupComplete: false,
    biometricsEnabled: false,
  },
};

export const useLedger = () => {
  const [data, setData] = useState<LedgerData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      const ledgerData = await service.getLedgerData();
      setData(ledgerData);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load ledger data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLedgerData();
  }, [loadLedgerData]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    const updated = await service.addTransaction(input);
    setData(updated);
  }, []);

  const updateTransaction = useCallback(async (id: string, update: TransactionUpdate) => {
    const updated = await service.updateTransaction(id, update);
    setData(updated);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = await service.deleteTransaction(id);
    setData(updated);
  }, []);

  const markAsSettled = useCallback(async (id: string) => {
    const updated = await service.markAsSettled(id);
    setData(updated);
  }, []);

  const updatePreferences = useCallback(async (update: Partial<UserPreferences>) => {
    const updated = await service.updatePreferences(update);
    setData(updated);
  }, []);

  const dashboard = useMemo(() => service.getDashboardSummary(data), [data]);
  const personSummaries = useMemo(() => service.getPersonSummaries(data), [data]);
  const insights = useMemo<InsightSummary>(() => service.getInsights(data), [data]);

  const getTransactionsByPerson = useCallback(
    (personId: string): Transaction[] => service.getTransactionsByPerson(data, personId),
    [data]
  );

  const getPersonById = useCallback(
    (personId: string): Person | undefined => data.persons.find((person) => person.id === personId),
    [data.persons]
  );

  return {
    loading,
    error,
    data,
    preferences: data.preferences,
    dashboard,
    personSummaries,
    insights,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markAsSettled,
    updatePreferences,
    getTransactionsByPerson,
    getPersonById,
  };
};

export type LedgerViewModel = ReturnType<typeof useLedger>;
export type { PersonSummary };


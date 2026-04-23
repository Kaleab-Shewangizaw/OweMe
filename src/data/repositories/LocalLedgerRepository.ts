import { LedgerData } from '../../domain/models/entities';
import { LedgerRepository } from '../../domain/repositories/LedgerRepository';
import { AsyncStorageClient } from '../storage/AsyncStorageClient';

const LEDGER_KEY = 'ledgerly-ledger-data-v1';

const EMPTY_DATA: LedgerData = {
  persons: [],
  transactions: [],
  preferences: {
    isSetupComplete: false,
    biometricsEnabled: false,
  },
};

export class LocalLedgerRepository implements LedgerRepository {
  constructor(private readonly storageClient: AsyncStorageClient) {}

  async getLedgerData(): Promise<LedgerData> {
    const data = await this.storageClient.get<LedgerData>(LEDGER_KEY);
    if (!data) return EMPTY_DATA;
    
    // Migration: ensure preferences exist
    if (!data.preferences) {
      data.preferences = EMPTY_DATA.preferences;
    }
    return data;
  }


  async saveLedgerData(data: LedgerData): Promise<void> {
    await this.storageClient.set<LedgerData>(LEDGER_KEY, data);
  }
}

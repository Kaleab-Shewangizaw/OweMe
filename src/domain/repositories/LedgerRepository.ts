import { LedgerData } from '../models/entities';

export interface LedgerRepository {
  getLedgerData(): Promise<LedgerData>;
  saveLedgerData(data: LedgerData): Promise<void>;
}

import Dexie, { Table } from 'dexie';

// Tipos para armazenamento local
export interface LocalTransaction {
  id: string;
  type: string;
  category: string;
  date: string;
  description: string;
  value: number;
  createdAt: number;
  userId: string;
  // Campos de sincronização
  syncStatus: 'synced' | 'pending' | 'conflict';
  localUpdatedAt: number;
  serverUpdatedAt?: number;
  isDeleted?: boolean;
}

export interface LocalDebt {
  id: string;
  name: string;
  totalValue: number;
  monthlyInstallment: number;
  startDate: string;
  paidValue: number;
  createdAt: number;
  userId: string;
  // Campos de sincronização
  syncStatus: 'synced' | 'pending' | 'conflict';
  localUpdatedAt: number;
  serverUpdatedAt?: number;
  isDeleted?: boolean;
}

export interface LocalInvestmentGoal {
  id: string;
  type: string;
  targetValue: number;
  createdAt: number;
  userId: string;
  // Campos de sincronização
  syncStatus: 'synced' | 'pending' | 'conflict';
  localUpdatedAt: number;
  serverUpdatedAt?: number;
  isDeleted?: boolean;
}

export interface SyncMeta {
  id: string;
  lastSyncAt: number;
  userId: string;
}

// Database class
class FinanceDatabase extends Dexie {
  transactions!: Table<LocalTransaction, string>;
  debts!: Table<LocalDebt, string>;
  investmentGoals!: Table<LocalInvestmentGoal, string>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('FinanceOfflineDB');
    
    this.version(1).stores({
      transactions: 'id, userId, syncStatus, localUpdatedAt, isDeleted',
      debts: 'id, userId, syncStatus, localUpdatedAt, isDeleted',
      investmentGoals: 'id, userId, type, syncStatus, localUpdatedAt, isDeleted',
      syncMeta: 'id, userId',
    });
  }
}

export const db = new FinanceDatabase();

// Utilitários para gerar IDs temporários
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isTempId = (id: string): boolean => {
  return id.startsWith('temp_');
};

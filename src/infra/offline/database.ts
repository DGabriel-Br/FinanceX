import Dexie, { Table } from 'dexie';

// Tipos base para sincronização
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface SyncableEntity {
  id: string;
  userId: string;
  syncStatus: SyncStatus;
  localUpdatedAt: number;
  serverUpdatedAt?: number;
  version: number; // Para resolução de conflitos
  isDeleted?: boolean;
  lastError?: string;
}

// Entidades locais
export interface LocalTransaction extends SyncableEntity {
  type: string;
  category: string;
  date: string;
  description: string;
  value: number;
  createdAt: number;
}

export interface LocalDebt extends SyncableEntity {
  name: string;
  totalValue: number;
  monthlyInstallment: number;
  startDate: string;
  paidValue: number;
  createdAt: number;
}

export interface LocalInvestmentGoal extends SyncableEntity {
  type: string;
  targetValue: number;
  createdAt: number;
}

export interface LocalCustomCategory extends SyncableEntity {
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
  createdAt: number;
}

export interface LocalHiddenCategory extends SyncableEntity {
  categoryKey: string;
  type: 'receita' | 'despesa';
  createdAt: number;
}

export interface LocalCategoryOrder extends SyncableEntity {
  categoryKey: string;
  type: 'receita' | 'despesa';
  position: number;
}

// Fila de operações para sincronização ordenada
export type OperationType = 'create' | 'update' | 'delete';
export type EntityType = 'transaction' | 'debt' | 'investmentGoal' | 'customCategory' | 'hiddenCategory' | 'categoryOrder';

export interface OperationQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  operationType: OperationType;
  timestamp: number;
  userId: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  payload?: Record<string, unknown>; // Dados para criar/atualizar
}

// Cursor para sync incremental (updated_at, id)
export interface SyncCursor {
  updatedAt: string; // ISO string de TIMESTAMPTZ
  id: string;
}

// Metadados de sincronização
export interface SyncMeta {
  id: string;
  userId: string;
  lastSyncAt: number;
  lastFullSyncAt?: number;
  syncVersion: number;
  lastCursor?: SyncCursor;
}

// Configurações do usuário local
export interface UserSettings {
  id: string;
  userId: string;
  encryptionEnabled: boolean;
  autoSyncEnabled: boolean;
  syncIntervalMs: number;
  lastActiveAt: number;
}

// Database class
class FinanceDatabase extends Dexie {
  transactions!: Table<LocalTransaction, string>;
  debts!: Table<LocalDebt, string>;
  investmentGoals!: Table<LocalInvestmentGoal, string>;
  customCategories!: Table<LocalCustomCategory, string>;
  hiddenCategories!: Table<LocalHiddenCategory, string>;
  categoryOrder!: Table<LocalCategoryOrder, string>;
  operationQueue!: Table<OperationQueueItem, string>;
  syncMeta!: Table<SyncMeta, string>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super('FinanceOfflineDB');
    
    // Versão 2 com suporte completo offline-first
    this.version(2).stores({
      transactions: 'id, userId, syncStatus, localUpdatedAt, isDeleted, date, type, category',
      debts: 'id, userId, syncStatus, localUpdatedAt, isDeleted',
      investmentGoals: 'id, userId, type, syncStatus, localUpdatedAt, isDeleted',
      customCategories: 'id, userId, type, syncStatus, localUpdatedAt, isDeleted',
      hiddenCategories: 'id, userId, [categoryKey+type], syncStatus, localUpdatedAt, isDeleted',
      categoryOrder: 'id, userId, [categoryKey+type], syncStatus, localUpdatedAt',
      operationQueue: 'id, entityType, entityId, timestamp, userId, retryCount',
      syncMeta: 'id, userId',
      userSettings: 'id, userId',
    }).upgrade(tx => {
      // Migrar dados existentes adicionando campo version
      return Promise.all([
        tx.table('transactions').toCollection().modify(item => {
          if (item.version === undefined) item.version = 1;
        }),
        tx.table('debts').toCollection().modify(item => {
          if (item.version === undefined) item.version = 1;
        }),
        tx.table('investmentGoals').toCollection().modify(item => {
          if (item.version === undefined) item.version = 1;
        }),
      ]);
    });

    // Manter compatibilidade com versão 1
    this.version(1).stores({
      transactions: 'id, userId, syncStatus, localUpdatedAt, isDeleted',
      debts: 'id, userId, syncStatus, localUpdatedAt, isDeleted',
      investmentGoals: 'id, userId, type, syncStatus, localUpdatedAt, isDeleted',
      syncMeta: 'id, userId',
    });
  }

  // Adicionar operação à fila
  async enqueueOperation(
    entityType: EntityType,
    entityId: string,
    operationType: OperationType,
    userId: string,
    payload?: Record<string, unknown>
  ): Promise<string> {
    const id = generateOperationId();
    const operation: OperationQueueItem = {
      id,
      entityType,
      entityId,
      operationType,
      timestamp: Date.now(),
      userId,
      retryCount: 0,
      maxRetries: 3,
      payload,
    };
    await this.operationQueue.add(operation);
    return id;
  }

  // Obter operações pendentes ordenadas por timestamp
  async getPendingOperations(userId: string): Promise<OperationQueueItem[]> {
    return this.operationQueue
      .where('userId')
      .equals(userId)
      .sortBy('timestamp');
  }

  // Marcar operação como concluída (remover da fila)
  async completeOperation(operationId: string): Promise<void> {
    await this.operationQueue.delete(operationId);
  }

  // Incrementar retry e registrar erro
  async failOperation(operationId: string, error: string): Promise<boolean> {
    const operation = await this.operationQueue.get(operationId);
    if (!operation) return false;

    const newRetryCount = operation.retryCount + 1;
    
    if (newRetryCount >= operation.maxRetries) {
      // Mover para estado de erro permanente (manter na fila com flag)
      await this.operationQueue.update(operationId, {
        retryCount: newRetryCount,
        lastError: error,
      });
      return false; // Não deve mais tentar
    }

    await this.operationQueue.update(operationId, {
      retryCount: newRetryCount,
      lastError: error,
    });
    return true; // Pode tentar novamente
  }

  // Limpar operações antigas concluídas
  async cleanupOldOperations(userId: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    const oldOps = await this.operationQueue
      .where('userId')
      .equals(userId)
      .filter(op => op.timestamp < cutoff && op.retryCount >= op.maxRetries)
      .toArray();
    
    const ids = oldOps.map(op => op.id);
    await this.operationQueue.bulkDelete(ids);
    return ids.length;
  }

  // Obter contagem de operações pendentes
  async getPendingOperationCount(userId: string): Promise<number> {
    return this.operationQueue
      .where('userId')
      .equals(userId)
      .filter(op => op.retryCount < op.maxRetries)
      .count();
  }

  // Verificar se há conflitos
  async hasConflicts(userId: string): Promise<boolean> {
    const conflictTransactions = await this.transactions
      .where('syncStatus')
      .equals('conflict')
      .filter(t => t.userId === userId)
      .count();
    
    const conflictDebts = await this.debts
      .where('syncStatus')
      .equals('conflict')
      .filter(d => d.userId === userId)
      .count();
    
    const conflictGoals = await this.investmentGoals
      .where('syncStatus')
      .equals('conflict')
      .filter(g => g.userId === userId)
      .count();

    return (conflictTransactions + conflictDebts + conflictGoals) > 0;
  }

  // Limpar todos os dados de um usuário (para logout)
  async clearUserData(userId: string): Promise<void> {
    await Promise.all([
      this.transactions.where('userId').equals(userId).delete(),
      this.debts.where('userId').equals(userId).delete(),
      this.investmentGoals.where('userId').equals(userId).delete(),
      this.customCategories.where('userId').equals(userId).delete(),
      this.hiddenCategories.where('userId').equals(userId).delete(),
      this.categoryOrder.where('userId').equals(userId).delete(),
      this.operationQueue.where('userId').equals(userId).delete(),
      this.syncMeta.where('userId').equals(userId).delete(),
      this.userSettings.where('userId').equals(userId).delete(),
    ]);
  }

  // Obter estatísticas do banco local
  async getStats(userId: string): Promise<{
    transactions: number;
    debts: number;
    goals: number;
    pendingSync: number;
    conflicts: number;
  }> {
    const [transactions, debts, goals, pendingSync, conflicts] = await Promise.all([
      this.transactions.where('userId').equals(userId).filter(t => !t.isDeleted).count(),
      this.debts.where('userId').equals(userId).filter(d => !d.isDeleted).count(),
      this.investmentGoals.where('userId').equals(userId).filter(g => !g.isDeleted).count(),
      this.getPendingOperationCount(userId),
      this.hasConflicts(userId).then(has => has ? 1 : 0),
    ]);

    return { transactions, debts, goals, pendingSync, conflicts };
  }
}

export const db = new FinanceDatabase();

// Utilitários para gerar IDs
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateOperationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isTempId = (id: string): boolean => {
  return id.startsWith('temp_');
};

// Função para criar entidade base sincronizável
export const createSyncableEntity = (userId: string, id?: string): Omit<SyncableEntity, 'id'> & { id: string } => ({
  id: id || generateTempId(),
  userId,
  syncStatus: 'pending',
  localUpdatedAt: Date.now(),
  version: 1,
});

// Resolução de conflitos: última escrita vence (last-write-wins)
export const resolveConflict = <T extends SyncableEntity>(
  local: T,
  server: T
): { winner: 'local' | 'server'; resolved: T } => {
  // Se local foi modificado mais recentemente, local vence
  if (local.localUpdatedAt > (server.serverUpdatedAt || 0)) {
    return {
      winner: 'local',
      resolved: { ...local, syncStatus: 'pending' as SyncStatus },
    };
  }
  // Caso contrário, servidor vence
  return {
    winner: 'server',
    resolved: { 
      ...server, 
      syncStatus: 'synced' as SyncStatus,
      localUpdatedAt: Date.now(),
    },
  };
};

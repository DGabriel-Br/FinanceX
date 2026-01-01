/**
 * Offline Infrastructure Module
 * 
 * Esta camada isola toda a complexidade de sincronização offline-first.
 * Inclui: Dexie DB, fila de operações, resolução de conflitos e serviço de sync.
 */

// Database e tipos
export {
  db,
  generateTempId,
  generateOperationId,
  isTempId,
  createSyncableEntity,
  resolveConflict,
  type SyncStatus,
  type SyncableEntity,
  type LocalTransaction,
  type LocalDebt,
  type LocalInvestmentGoal,
  type LocalCustomCategory,
  type LocalHiddenCategory,
  type LocalCategoryOrder,
  type OperationType,
  type EntityType,
  type OperationQueueItem,
  type SyncMeta,
  type UserSettings,
} from './database';

// Batch operations
export {
  batchInsertTransactions,
  batchUpsertTransactions,
  batchDeleteTransactions,
  batchUpsertDebts,
  batchDeleteDebts,
  batchUpsertGoals,
  batchDeleteGoals,
  type BatchInsertResult,
} from './batchOperations';

// Repository (offline-first patterns)
export {
  offlineAdd,
  offlineUpdate,
  offlineDelete,
  transactionMessages,
  debtMessages,
  goalMessages,
} from './repository';

// Sync service
export { syncService, type SyncResult } from './syncService';

/**
 * Batch operations for Dexie database
 * Replaces item-by-item inserts with bulk operations for better performance
 */

import { db, LocalTransaction, LocalDebt, LocalInvestmentGoal, generateTempId } from './database';
import { logger } from '@/lib/logger';

export interface BatchInsertResult {
  inserted: number;
  failed: number;
  errors: string[];
}

/**
 * Batch insert transactions into local database
 * Much faster than inserting one by one
 */
export const batchInsertTransactions = async (
  transactions: Array<Omit<LocalTransaction, 'id' | 'syncStatus' | 'localUpdatedAt' | 'version'>>,
  userId: string
): Promise<BatchInsertResult> => {
  const result: BatchInsertResult = { inserted: 0, failed: 0, errors: [] };
  
  if (transactions.length === 0) return result;
  
  const now = Date.now();
  const entitiesToInsert: LocalTransaction[] = transactions.map(t => ({
    ...t,
    id: generateTempId(),
    userId,
    syncStatus: 'pending',
    localUpdatedAt: now,
    version: 1,
  }));

  try {
    // Use bulkAdd for atomic batch insert
    await db.transactions.bulkAdd(entitiesToInsert);
    result.inserted = entitiesToInsert.length;
    logger.info(`Batch inserted ${result.inserted} transactions`);
  } catch (error) {
    logger.error('Batch insert failed, falling back to individual inserts:', error);
    
    // Fallback: try individual inserts
    for (const entity of entitiesToInsert) {
      try {
        await db.transactions.add(entity);
        result.inserted++;
      } catch (e) {
        result.failed++;
        result.errors.push(`Transaction ${entity.description}: ${e}`);
      }
    }
  }

  return result;
};

/**
 * Batch update/upsert transactions from server
 * Uses bulkPut for atomic upsert operation
 */
export const batchUpsertTransactions = async (
  transactions: LocalTransaction[]
): Promise<number> => {
  if (transactions.length === 0) return 0;
  
  try {
    await db.transactions.bulkPut(transactions);
    logger.info(`Batch upserted ${transactions.length} transactions`);
    return transactions.length;
  } catch (error) {
    logger.error('Batch upsert failed:', error);
    
    // Fallback to individual puts
    let upserted = 0;
    for (const t of transactions) {
      try {
        await db.transactions.put(t);
        upserted++;
      } catch (e) {
        logger.error(`Failed to upsert transaction ${t.id}:`, e);
      }
    }
    return upserted;
  }
};

/**
 * Batch delete transactions by IDs
 */
export const batchDeleteTransactions = async (ids: string[]): Promise<number> => {
  if (ids.length === 0) return 0;
  
  try {
    await db.transactions.bulkDelete(ids);
    logger.info(`Batch deleted ${ids.length} transactions`);
    return ids.length;
  } catch (error) {
    logger.error('Batch delete failed:', error);
    
    let deleted = 0;
    for (const id of ids) {
      try {
        await db.transactions.delete(id);
        deleted++;
      } catch (e) {
        logger.error(`Failed to delete transaction ${id}:`, e);
      }
    }
    return deleted;
  }
};

/**
 * Batch upsert debts from server
 */
export const batchUpsertDebts = async (debts: LocalDebt[]): Promise<number> => {
  if (debts.length === 0) return 0;
  
  try {
    await db.debts.bulkPut(debts);
    logger.info(`Batch upserted ${debts.length} debts`);
    return debts.length;
  } catch (error) {
    logger.error('Batch upsert debts failed:', error);
    
    let upserted = 0;
    for (const d of debts) {
      try {
        await db.debts.put(d);
        upserted++;
      } catch (e) {
        logger.error(`Failed to upsert debt ${d.id}:`, e);
      }
    }
    return upserted;
  }
};

/**
 * Batch delete debts by IDs
 */
export const batchDeleteDebts = async (ids: string[]): Promise<number> => {
  if (ids.length === 0) return 0;
  
  try {
    await db.debts.bulkDelete(ids);
    return ids.length;
  } catch (error) {
    logger.error('Batch delete debts failed:', error);
    
    let deleted = 0;
    for (const id of ids) {
      try {
        await db.debts.delete(id);
        deleted++;
      } catch (e) {
        logger.error(`Failed to delete debt ${id}:`, e);
      }
    }
    return deleted;
  }
};

/**
 * Batch upsert investment goals from server
 */
export const batchUpsertGoals = async (goals: LocalInvestmentGoal[]): Promise<number> => {
  if (goals.length === 0) return 0;
  
  try {
    await db.investmentGoals.bulkPut(goals);
    logger.info(`Batch upserted ${goals.length} goals`);
    return goals.length;
  } catch (error) {
    logger.error('Batch upsert goals failed:', error);
    
    let upserted = 0;
    for (const g of goals) {
      try {
        await db.investmentGoals.put(g);
        upserted++;
      } catch (e) {
        logger.error(`Failed to upsert goal ${g.id}:`, e);
      }
    }
    return upserted;
  }
};

/**
 * Batch delete goals by IDs
 */
export const batchDeleteGoals = async (ids: string[]): Promise<number> => {
  if (ids.length === 0) return 0;
  
  try {
    await db.investmentGoals.bulkDelete(ids);
    return ids.length;
  } catch (error) {
    logger.error('Batch delete goals failed:', error);
    
    let deleted = 0;
    for (const id of ids) {
      try {
        await db.investmentGoals.delete(id);
        deleted++;
      } catch (e) {
        logger.error(`Failed to delete goal ${id}:`, e);
      }
    }
    return deleted;
  }
};

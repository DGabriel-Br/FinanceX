import { db, isTempId, LocalTransaction, LocalDebt, LocalInvestmentGoal } from './database';
import { 
  batchUpsertTransactions, 
  batchDeleteTransactions, 
  batchUpsertDebts, 
  batchDeleteDebts, 
  batchUpsertGoals, 
  batchDeleteGoals 
} from './batchOperations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface SyncResult {
  success: boolean;
  syncedTransactions: number;
  syncedDebts: number;
  syncedGoals: number;
  errors: string[];
}

class SyncService {
  private isSyncing = false;
  private syncListeners: Set<(syncing: boolean) => void> = new Set();

  // Adicionar listener para estado de sincronização
  addSyncListener(listener: (syncing: boolean) => void) {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifyListeners() {
    this.syncListeners.forEach(listener => listener(this.isSyncing));
  }

  // Sincronizar todos os dados pendentes
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, syncedTransactions: 0, syncedDebts: 0, syncedGoals: 0, errors: ['Sincronização já em andamento'] };
    }

    this.isSyncing = true;
    this.notifyListeners();

    const result: SyncResult = {
      success: true,
      syncedTransactions: 0,
      syncedDebts: 0,
      syncedGoals: 0,
      errors: [],
    };

    try {
      // Verificar se está online primeiro
      if (!navigator.onLine) {
        result.success = false;
        result.errors.push('Sem conexão com a internet');
        return result;
      }

      // SECURITY: Strict session validation before any sync operations
      // This is critical to prevent sync with stale or invalid sessions
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Fail closed: Any session error means no sync
      if (sessionError) {
        logger.error('Session validation error during sync:', sessionError);
        result.success = false;
        result.errors.push('Erro ao validar sessão');
        return result;
      }
      
      const user = session?.user;
      const userId = user?.id;
      
      // SECURITY: Both session and userId must exist
      // This prevents sync operations with partial/corrupted session state
      if (!session || !user || !userId) {
        logger.warn('Sync blocked: Invalid session state', { 
          hasSession: !!session, 
          hasUser: !!user, 
          hasUserId: !!userId 
        });
        result.success = false;
        result.errors.push('Usuário não autenticado');
        return result;
      }
      
      // SECURITY: Validate userId format (UUID v4)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.error('Sync blocked: Invalid userId format', { userId });
        result.success = false;
        result.errors.push('ID de usuário inválido');
        return result;
      }

      // Sincronizar transações
      result.syncedTransactions = await this.syncTransactions(user.id, result.errors);
      
      // Sincronizar dívidas
      result.syncedDebts = await this.syncDebts(user.id, result.errors);
      
      // Sincronizar metas
      result.syncedGoals = await this.syncGoals(user.id, result.errors);

      // Baixar dados do servidor
      await this.pullFromServer(user.id);

      // Atualizar meta de sincronização
      await db.syncMeta.put({
        id: 'lastSync',
        lastSyncAt: Date.now(),
        userId: user.id,
        syncVersion: 1,
      });

      result.success = result.errors.length === 0;
    } catch (error) {
      logger.error('Erro na sincronização:', error);
      result.success = false;
      result.errors.push('Erro geral na sincronização');
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return result;
  }

  // Sincronizar transações pendentes
  private async syncTransactions(userId: string, errors: string[]): Promise<number> {
    let synced = 0;
    
    // Buscar transações pendentes (não deletadas)
    const pendingTransactions = await db.transactions
      .where('syncStatus')
      .equals('pending')
      .filter(t => !t.isDeleted && t.userId === userId)
      .toArray();

    for (const transaction of pendingTransactions) {
      try {
        if (isTempId(transaction.id)) {
          // Criar nova transação no servidor
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              type: transaction.type,
              category: transaction.category,
              date: transaction.date,
              description: transaction.description,
              value: transaction.value,
              user_id: userId,
            })
            .select()
            .single();

          if (error) throw error;

          // Atualizar com ID real do servidor
          await db.transactions.delete(transaction.id);
          await db.transactions.put({
            ...transaction,
            id: data.id,
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        } else {
          // Atualizar transação existente
          // SECURITY: Always include user_id filter for defense in depth
          const { error } = await supabase
            .from('transactions')
            .update({
              type: transaction.type,
              category: transaction.category,
              date: transaction.date,
              description: transaction.description,
              value: transaction.value,
            })
            .eq('id', transaction.id)
            .eq('user_id', userId);

          if (error) throw error;

          await db.transactions.update(transaction.id, {
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        }
        synced++;
      } catch (error) {
        logger.error('Erro ao sincronizar transação:', error);
        errors.push(`Transação: ${transaction.description}`);
      }
    }

    // Sincronizar deletados - buscar por isDeleted === true
    const deletedTransactions = await db.transactions
      .filter(t => t.isDeleted === true && t.userId === userId && !isTempId(t.id))
      .toArray();

    logger.info(`Transações deletadas para sincronizar: ${deletedTransactions.length}`);

    for (const transaction of deletedTransactions) {
      try {
        // SECURITY: Always include user_id filter for defense in depth
        const { error } = await supabase.from('transactions').delete().eq('id', transaction.id).eq('user_id', userId);
        if (error) {
          logger.error('Erro ao deletar transação no servidor:', error);
        } else {
          await db.transactions.delete(transaction.id);
          synced++;
          logger.info(`Transação deletada do servidor: ${transaction.id}`);
        }
      } catch (error) {
        logger.error('Erro ao deletar transação no servidor:', error);
      }
    }

    // Limpar transações temporárias deletadas
    await db.transactions
      .filter(t => t.isDeleted === true && isTempId(t.id))
      .delete();

    return synced;
  }

  // Sincronizar dívidas pendentes
  private async syncDebts(userId: string, errors: string[]): Promise<number> {
    let synced = 0;
    
    const pendingDebts = await db.debts
      .where('syncStatus')
      .equals('pending')
      .filter(d => !d.isDeleted && d.userId === userId)
      .toArray();

    for (const debt of pendingDebts) {
      try {
        if (isTempId(debt.id)) {
          const { data, error } = await supabase
            .from('debts')
            .insert({
              name: debt.name,
              total_value: debt.totalValue,
              monthly_installment: debt.monthlyInstallment,
              start_date: debt.startDate,
              paid_value: debt.paidValue,
              user_id: userId,
            })
            .select()
            .single();

          if (error) throw error;

          await db.debts.delete(debt.id);
          await db.debts.put({
            ...debt,
            id: data.id,
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        } else {
          // SECURITY: Always include user_id filter for defense in depth
          const { error } = await supabase
            .from('debts')
            .update({
              name: debt.name,
              total_value: debt.totalValue,
              monthly_installment: debt.monthlyInstallment,
              start_date: debt.startDate,
              paid_value: debt.paidValue,
            })
            .eq('id', debt.id)
            .eq('user_id', userId);

          if (error) throw error;

          await db.debts.update(debt.id, {
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        }
        synced++;
      } catch (error) {
        logger.error('Erro ao sincronizar dívida:', error);
        errors.push(`Dívida: ${debt.name}`);
      }
    }

    // Sincronizar deletados
    const deletedDebts = await db.debts
      .filter(d => d.isDeleted === true && d.userId === userId && !isTempId(d.id))
      .toArray();

    logger.info(`Dívidas deletadas para sincronizar: ${deletedDebts.length}`);

    for (const debt of deletedDebts) {
      try {
        // SECURITY: Always include user_id filter for defense in depth
        const { error } = await supabase.from('debts').delete().eq('id', debt.id).eq('user_id', userId);
        if (error) {
          logger.error('Erro ao deletar dívida no servidor:', error);
        } else {
          await db.debts.delete(debt.id);
          synced++;
          logger.info(`Dívida deletada do servidor: ${debt.id}`);
        }
      } catch (error) {
        logger.error('Erro ao deletar dívida no servidor:', error);
      }
    }

    await db.debts.filter(d => d.isDeleted === true && isTempId(d.id)).delete();

    return synced;
  }

  // Sincronizar metas pendentes
  private async syncGoals(userId: string, errors: string[]): Promise<number> {
    let synced = 0;
    
    const pendingGoals = await db.investmentGoals
      .where('syncStatus')
      .equals('pending')
      .filter(g => !g.isDeleted && g.userId === userId)
      .toArray();

    for (const goal of pendingGoals) {
      try {
        if (isTempId(goal.id)) {
          const { data, error } = await supabase
            .from('investment_goals')
            .insert({
              type: goal.type,
              target_value: goal.targetValue,
              user_id: userId,
            })
            .select()
            .single();

          if (error) throw error;

          await db.investmentGoals.delete(goal.id);
          await db.investmentGoals.put({
            ...goal,
            id: data.id,
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        } else {
          // SECURITY: Always include user_id filter for defense in depth
          const { error } = await supabase
            .from('investment_goals')
            .update({
              target_value: goal.targetValue,
            })
            .eq('id', goal.id)
            .eq('user_id', userId);

          if (error) throw error;

          await db.investmentGoals.update(goal.id, {
            syncStatus: 'synced',
            serverUpdatedAt: Date.now(),
          });
        }
        synced++;
      } catch (error) {
        logger.error('Erro ao sincronizar meta:', error);
        errors.push(`Meta: ${goal.type}`);
      }
    }

    // Sincronizar deletados
    const deletedGoals = await db.investmentGoals
      .filter(g => g.isDeleted === true && g.userId === userId && !isTempId(g.id))
      .toArray();

    logger.info(`Metas deletadas para sincronizar: ${deletedGoals.length}`);

    for (const goal of deletedGoals) {
      try {
        // SECURITY: Always include user_id filter for defense in depth
        const { error } = await supabase.from('investment_goals').delete().eq('id', goal.id).eq('user_id', userId);
        if (error) {
          logger.error('Erro ao deletar meta no servidor:', error);
        } else {
          await db.investmentGoals.delete(goal.id);
          synced++;
          logger.info(`Meta deletada do servidor: ${goal.id}`);
        }
      } catch (error) {
        logger.error('Erro ao deletar meta no servidor:', error);
      }
    }

    await db.investmentGoals.filter(g => g.isDeleted === true && isTempId(g.id)).delete();

    return synced;
  }

  // Baixar dados do servidor usando sync incremental
  // Usa lastSyncAt para puxar apenas dados modificados desde a última sincronização
  private async pullFromServer(userId: string): Promise<void> {
    // SECURITY: Always filter by user_id for defense in depth
    // Even though RLS should handle this, explicit filtering prevents data leakage
    
    // Obter timestamp da última sincronização
    const syncMeta = await db.syncMeta.get('lastSync');
    const lastSyncAt = syncMeta?.lastSyncAt || 0;
    const isFullSync = lastSyncAt === 0;
    
    logger.info(`Pull from server - ${isFullSync ? 'full sync' : `incremental since ${new Date(lastSyncAt).toISOString()}`}`);
    
    // Para sync incremental, buscar apenas itens modificados após lastSyncAt
    // Para full sync, buscar tudo
    await Promise.all([
      this.pullTransactions(userId, lastSyncAt, isFullSync),
      this.pullDebts(userId, lastSyncAt, isFullSync),
      this.pullGoals(userId, lastSyncAt, isFullSync),
    ]);
  }

  private async pullTransactions(userId: string, lastSyncAt: number, isFullSync: boolean): Promise<void> {
    // Buscar transações do servidor
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    
    // Sync incremental: buscar apenas modificados após lastSyncAt
    // Usa updated_at para capturar edições, não apenas criações
    if (!isFullSync && lastSyncAt > 0) {
      // updated_at é bigint em ms
      query = query.gt('updated_at', lastSyncAt);
    }
    
    // Ordenação determinística: updated_at DESC, id ASC (para empates)
    const { data: serverTransactions } = await query
      .order('updated_at', { ascending: false })
      .order('id', { ascending: true });

    if (serverTransactions && serverTransactions.length > 0) {
      const now = Date.now();
      
      // Preparar entidades para batch upsert
      const entitiesToUpsert: LocalTransaction[] = [];
      
      // Buscar locais pendentes para não sobrescrever
      const localPendingIds = new Set(
        (await db.transactions
          .where('syncStatus')
          .equals('pending')
          .filter(t => t.userId === userId)
          .toArray()
        ).map(t => t.id)
      );
      
      // Track IDs processados para evitar duplicação
      const processedIds = new Set<string>();
      
      for (const t of serverTransactions) {
        // Evitar duplicação e não sobrescrever pendentes
        if (!localPendingIds.has(t.id) && !processedIds.has(t.id)) {
          processedIds.add(t.id);
          entitiesToUpsert.push({
            id: t.id,
            type: t.type,
            category: t.category,
            date: t.date,
            description: t.description,
            value: Number(t.value),
            createdAt: Number(t.created_at),
            userId: t.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: now,
            serverUpdatedAt: Number(t.updated_at) || now,
            version: 1,
          });
        }
      }
      
      // Batch upsert
      if (entitiesToUpsert.length > 0) {
        await batchUpsertTransactions(entitiesToUpsert);
        logger.info(`Synced ${entitiesToUpsert.length} transactions from server`);
      }
    }

    // No full sync, remover transações locais que não existem mais no servidor
    if (isFullSync) {
      const { data: allServerTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId);
      
      if (allServerTransactions) {
        const serverIds = new Set(allServerTransactions.map(t => t.id));
        
        const localSyncedTransactions = await db.transactions
          .filter(t => t.userId === userId && t.syncStatus === 'synced' && !isTempId(t.id))
          .toArray();
        
        const idsToDelete = localSyncedTransactions
          .filter(local => !serverIds.has(local.id))
          .map(local => local.id);
        
        if (idsToDelete.length > 0) {
          await batchDeleteTransactions(idsToDelete);
          logger.info(`Deleted ${idsToDelete.length} stale transactions from local`);
        }
      }
    }
  }

  private async pullDebts(userId: string, lastSyncAt: number, isFullSync: boolean): Promise<void> {
    let query = supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId);
    
    // Sync incremental: usar updated_at (bigint em ms)
    if (!isFullSync && lastSyncAt > 0) {
      query = query.gt('updated_at', lastSyncAt);
    }
    
    // Ordenação determinística: updated_at DESC, id ASC
    const { data: serverDebts } = await query
      .order('updated_at', { ascending: false })
      .order('id', { ascending: true });

    if (serverDebts && serverDebts.length > 0) {
      const now = Date.now();
      
      const localPendingIds = new Set(
        (await db.debts
          .where('syncStatus')
          .equals('pending')
          .filter(d => d.userId === userId)
          .toArray()
        ).map(d => d.id)
      );
      
      const entitiesToUpsert: LocalDebt[] = [];
      const processedIds = new Set<string>();
      
      for (const d of serverDebts) {
        if (!localPendingIds.has(d.id) && !processedIds.has(d.id)) {
          processedIds.add(d.id);
          entitiesToUpsert.push({
            id: d.id,
            name: d.name,
            totalValue: Number(d.total_value),
            monthlyInstallment: Number(d.monthly_installment),
            startDate: d.start_date,
            paidValue: Number(d.paid_value || 0),
            createdAt: Number(d.created_at),
            userId: d.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: now,
            serverUpdatedAt: Number(d.updated_at) || now,
            version: 1,
          });
        }
      }
      
      if (entitiesToUpsert.length > 0) {
        await batchUpsertDebts(entitiesToUpsert);
        logger.info(`Synced ${entitiesToUpsert.length} debts from server`);
      }
    }

    if (isFullSync) {
      const { data: allServerDebts } = await supabase
        .from('debts')
        .select('id')
        .eq('user_id', userId);
      
      if (allServerDebts) {
        const serverIds = new Set(allServerDebts.map(d => d.id));
        
        const localSyncedDebts = await db.debts
          .filter(d => d.userId === userId && d.syncStatus === 'synced' && !isTempId(d.id))
          .toArray();
        
        const idsToDelete = localSyncedDebts
          .filter(local => !serverIds.has(local.id))
          .map(local => local.id);
        
        if (idsToDelete.length > 0) {
          await batchDeleteDebts(idsToDelete);
          logger.info(`Deleted ${idsToDelete.length} stale debts from local`);
        }
      }
    }
  }

  private async pullGoals(userId: string, lastSyncAt: number, isFullSync: boolean): Promise<void> {
    let query = supabase
      .from('investment_goals')
      .select('*')
      .eq('user_id', userId);
    
    // Sync incremental: usar updated_at (timestamp)
    if (!isFullSync && lastSyncAt > 0) {
      const lastSyncDate = new Date(lastSyncAt).toISOString();
      query = query.gt('updated_at', lastSyncDate);
    }
    
    // Ordenação determinística: updated_at DESC, id ASC
    const { data: serverGoals } = await query
      .order('updated_at', { ascending: false })
      .order('id', { ascending: true });

    if (serverGoals && serverGoals.length > 0) {
      const now = Date.now();
      
      const localPendingIds = new Set(
        (await db.investmentGoals
          .where('syncStatus')
          .equals('pending')
          .filter(g => g.userId === userId)
          .toArray()
        ).map(g => g.id)
      );
      
      const entitiesToUpsert: LocalInvestmentGoal[] = [];
      const processedIds = new Set<string>();
      
      for (const g of serverGoals) {
        if (!localPendingIds.has(g.id) && !processedIds.has(g.id)) {
          processedIds.add(g.id);
          entitiesToUpsert.push({
            id: g.id,
            type: g.type,
            targetValue: Number(g.target_value),
            createdAt: new Date(g.created_at).getTime(),
            userId: g.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: now,
            serverUpdatedAt: g.updated_at ? new Date(g.updated_at).getTime() : now,
            version: 1,
          });
        }
      }
      
      if (entitiesToUpsert.length > 0) {
        await batchUpsertGoals(entitiesToUpsert);
        logger.info(`Synced ${entitiesToUpsert.length} goals from server`);
      }
    }

    if (isFullSync) {
      const { data: allServerGoals } = await supabase
        .from('investment_goals')
        .select('id')
        .eq('user_id', userId);
      
      if (allServerGoals) {
        const serverIds = new Set(allServerGoals.map(g => g.id));
        
        const localSyncedGoals = await db.investmentGoals
          .filter(g => g.userId === userId && g.syncStatus === 'synced' && !isTempId(g.id))
          .toArray();
        
        const idsToDelete = localSyncedGoals
          .filter(local => !serverIds.has(local.id))
          .map(local => local.id);
        
        if (idsToDelete.length > 0) {
          await batchDeleteGoals(idsToDelete);
          logger.info(`Deleted ${idsToDelete.length} stale goals from local`);
        }
      }
    }
  }

  // Verificar se há dados pendentes
  async hasPendingChanges(userId: string): Promise<boolean> {
    const pendingTransactions = await db.transactions
      .where('syncStatus')
      .equals('pending')
      .filter(t => t.userId === userId)
      .count();
    
    const pendingDebts = await db.debts
      .where('syncStatus')
      .equals('pending')
      .filter(d => d.userId === userId)
      .count();
    
    const pendingGoals = await db.investmentGoals
      .where('syncStatus')
      .equals('pending')
      .filter(g => g.userId === userId)
      .count();

    return (pendingTransactions + pendingDebts + pendingGoals) > 0;
  }

  // Contar alterações pendentes
  async getPendingCount(userId: string): Promise<number> {
    const transactions = await db.transactions
      .where('syncStatus')
      .equals('pending')
      .filter(t => t.userId === userId)
      .count();
    
    const debts = await db.debts
      .where('syncStatus')
      .equals('pending')
      .filter(d => d.userId === userId)
      .count();
    
    const goals = await db.investmentGoals
      .where('syncStatus')
      .equals('pending')
      .filter(g => g.userId === userId)
      .count();

    return transactions + debts + goals;
  }
}

export const syncService = new SyncService();

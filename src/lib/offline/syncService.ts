import { db, isTempId, LocalTransaction, LocalDebt, LocalInvestmentGoal } from './database';
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

      // Usar getSession que funciona mesmo offline (usa cache local)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        result.success = false;
        result.errors.push('Usuário não autenticado');
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
          const { error } = await supabase
            .from('transactions')
            .update({
              type: transaction.type,
              category: transaction.category,
              date: transaction.date,
              description: transaction.description,
              value: transaction.value,
            })
            .eq('id', transaction.id);

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

    // Sincronizar deletados
    const deletedTransactions = await db.transactions
      .where('isDeleted')
      .equals(1)
      .filter(t => t.userId === userId && !isTempId(t.id))
      .toArray();

    for (const transaction of deletedTransactions) {
      try {
        await supabase.from('transactions').delete().eq('id', transaction.id);
        await db.transactions.delete(transaction.id);
        synced++;
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
          const { error } = await supabase
            .from('debts')
            .update({
              name: debt.name,
              total_value: debt.totalValue,
              monthly_installment: debt.monthlyInstallment,
              start_date: debt.startDate,
              paid_value: debt.paidValue,
            })
            .eq('id', debt.id);

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

    for (const debt of deletedDebts) {
      try {
        await supabase.from('debts').delete().eq('id', debt.id);
        await db.debts.delete(debt.id);
        synced++;
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
          const { error } = await supabase
            .from('investment_goals')
            .update({
              target_value: goal.targetValue,
            })
            .eq('id', goal.id);

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

    for (const goal of deletedGoals) {
      try {
        await supabase.from('investment_goals').delete().eq('id', goal.id);
        await db.investmentGoals.delete(goal.id);
        synced++;
      } catch (error) {
        logger.error('Erro ao deletar meta no servidor:', error);
      }
    }

    await db.investmentGoals.filter(g => g.isDeleted === true && isTempId(g.id)).delete();

    return synced;
  }

  // Baixar dados do servidor e sincronizar com local
  private async pullFromServer(userId: string): Promise<void> {
    // Buscar transações do servidor
    const { data: serverTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (serverTransactions) {
      // Obter IDs do servidor
      const serverIds = new Set(serverTransactions.map(t => t.id));
      
      // Remover transações locais sincronizadas que não existem mais no servidor
      const localSyncedTransactions = await db.transactions
        .where('userId')
        .equals(userId)
        .filter(t => t.syncStatus === 'synced' && !isTempId(t.id))
        .toArray();
      
      for (const local of localSyncedTransactions) {
        if (!serverIds.has(local.id)) {
          await db.transactions.delete(local.id);
        }
      }
      
      // Atualizar/adicionar transações do servidor
      for (const t of serverTransactions) {
        const local = await db.transactions.get(t.id);
        // Só atualiza se não existe local ou se está sincronizado (não tem mudanças pendentes)
        if (!local || local.syncStatus === 'synced') {
          await db.transactions.put({
            id: t.id,
            type: t.type,
            category: t.category,
            date: t.date,
            description: t.description,
            value: Number(t.value),
            createdAt: Number(t.created_at),
            userId: t.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: Date.now(),
            serverUpdatedAt: Date.now(),
            version: 1,
          });
        }
      }
    }

    // Buscar dívidas do servidor
    const { data: serverDebts } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });

    if (serverDebts) {
      const serverDebtIds = new Set(serverDebts.map(d => d.id));
      
      // Remover dívidas locais sincronizadas que não existem mais no servidor
      const localSyncedDebts = await db.debts
        .where('userId')
        .equals(userId)
        .filter(d => d.syncStatus === 'synced' && !isTempId(d.id))
        .toArray();
      
      for (const local of localSyncedDebts) {
        if (!serverDebtIds.has(local.id)) {
          await db.debts.delete(local.id);
        }
      }
      
      for (const d of serverDebts) {
        const local = await db.debts.get(d.id);
        if (!local || local.syncStatus === 'synced') {
          await db.debts.put({
            id: d.id,
            name: d.name,
            totalValue: Number(d.total_value),
            monthlyInstallment: Number(d.monthly_installment),
            startDate: d.start_date,
            paidValue: Number(d.paid_value || 0),
            createdAt: Number(d.created_at),
            userId: d.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: Date.now(),
            serverUpdatedAt: Date.now(),
            version: 1,
          });
        }
      }
    }

    // Buscar metas do servidor
    const { data: serverGoals } = await supabase
      .from('investment_goals')
      .select('*');

    if (serverGoals) {
      const serverGoalIds = new Set(serverGoals.map(g => g.id));
      
      // Remover metas locais sincronizadas que não existem mais no servidor
      const localSyncedGoals = await db.investmentGoals
        .where('userId')
        .equals(userId)
        .filter(g => g.syncStatus === 'synced' && !isTempId(g.id))
        .toArray();
      
      for (const local of localSyncedGoals) {
        if (!serverGoalIds.has(local.id)) {
          await db.investmentGoals.delete(local.id);
        }
      }
      
      for (const g of serverGoals) {
        const local = await db.investmentGoals.get(g.id);
        if (!local || local.syncStatus === 'synced') {
          await db.investmentGoals.put({
            id: g.id,
            type: g.type,
            targetValue: Number(g.target_value),
            createdAt: new Date(g.created_at).getTime(),
            userId: g.user_id || userId,
            syncStatus: 'synced',
            localUpdatedAt: Date.now(),
            serverUpdatedAt: Date.now(),
            version: 1,
          });
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

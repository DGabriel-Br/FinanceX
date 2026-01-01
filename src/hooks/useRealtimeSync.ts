import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { db, isTempId } from '@/infra/offline/database';
import { useAuthContext } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export const useRealtimeSync = () => {
  const { user } = useAuthContext();
  const userId = user?.id;

  const handleTransactionChange = useCallback(async (payload: any) => {
    if (!userId) return;
    
    logger.info('Realtime transaction change:', payload.eventType);
    
    try {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const record = payload.new;
        if (record.user_id !== userId) return;

        const existing = await db.transactions.get(record.id);
        
        // CRÍTICO: Não sobrescrever alterações locais pendentes
        if (existing && existing.syncStatus === 'pending') {
          logger.info('Skipping realtime update - local pending changes exist for:', record.id);
          return;
        }
        
        // Verificar se não é um item que estamos criando localmente (evitar duplicação)
        const tempItems = await db.transactions
          .filter(t => isTempId(t.id) && t.userId === userId && t.syncStatus === 'pending')
          .toArray();
        
        // Se há itens temporários com mesma descrição, data e valor, pode ser duplicação
        const isDuplicate = tempItems.some(t => 
          t.description === record.description && 
          t.date === record.date && 
          t.value === Number(record.value) &&
          t.type === record.type &&
          t.category === record.category
        );
        
        if (isDuplicate) {
          logger.info('Skipping realtime insert - possible duplicate from local creation:', record.id);
          return;
        }
        
        // Usar updated_at do servidor (TIMESTAMPTZ)
        const serverUpdatedAtMs = new Date(record.updated_at).getTime();
        
        await db.transactions.put({
          id: record.id,
          type: record.type,
          category: record.category,
          date: record.date,
          description: record.description,
          value: Number(record.value),
          createdAt: Number(record.created_at),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: serverUpdatedAtMs,
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (!record || record.user_id !== userId) return;
        
        const existing = await db.transactions.get(record.id);
        
        // Não deletar se há alterações pendentes (o usuário pode ter re-editado)
        if (existing && existing.syncStatus === 'pending' && !existing.isDeleted) {
          logger.info('Skipping realtime delete - local pending changes exist for:', record.id);
          return;
        }
        
        await db.transactions.delete(record.id);
      }
    } catch (error) {
      logger.error('Error handling realtime transaction:', error);
    }
  }, [userId]);

  const handleDebtChange = useCallback(async (payload: any) => {
    if (!userId) return;
    
    logger.info('Realtime debt change:', payload.eventType);
    
    try {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const record = payload.new;
        if (record.user_id !== userId) return;

        const existing = await db.debts.get(record.id);
        
        // CRÍTICO: Não sobrescrever alterações locais pendentes
        if (existing && existing.syncStatus === 'pending') {
          logger.info('Skipping realtime update - local pending changes exist for:', record.id);
          return;
        }
        
        // Verificar duplicação
        const tempItems = await db.debts
          .filter(d => isTempId(d.id) && d.userId === userId && d.syncStatus === 'pending')
          .toArray();
        
        const isDuplicate = tempItems.some(d => 
          d.name === record.name && 
          d.totalValue === Number(record.total_value)
        );
        
        if (isDuplicate) {
          logger.info('Skipping realtime insert - possible duplicate from local creation:', record.id);
          return;
        }
        
        // Usar updated_at do servidor (TIMESTAMPTZ)
        const serverUpdatedAtMs = new Date(record.updated_at).getTime();
        
        await db.debts.put({
          id: record.id,
          name: record.name,
          totalValue: Number(record.total_value),
          monthlyInstallment: Number(record.monthly_installment),
          startDate: record.start_date,
          paidValue: Number(record.paid_value),
          createdAt: Number(record.created_at),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: serverUpdatedAtMs,
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (!record || record.user_id !== userId) return;
        
        const existing = await db.debts.get(record.id);
        
        if (existing && existing.syncStatus === 'pending' && !existing.isDeleted) {
          logger.info('Skipping realtime delete - local pending changes exist for:', record.id);
          return;
        }
        
        await db.debts.delete(record.id);
      }
    } catch (error) {
      logger.error('Error handling realtime debt:', error);
    }
  }, [userId]);

  const handleGoalChange = useCallback(async (payload: any) => {
    if (!userId) return;
    
    logger.info('Realtime goal change:', payload.eventType);
    
    try {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const record = payload.new;
        if (record.user_id !== userId) return;

        const existing = await db.investmentGoals.get(record.id);
        
        // CRÍTICO: Não sobrescrever alterações locais pendentes
        if (existing && existing.syncStatus === 'pending') {
          logger.info('Skipping realtime update - local pending changes exist for:', record.id);
          return;
        }
        
        // Verificar duplicação
        const tempItems = await db.investmentGoals
          .filter(g => isTempId(g.id) && g.userId === userId && g.syncStatus === 'pending')
          .toArray();
        
        const isDuplicate = tempItems.some(g => 
          g.type === record.type && 
          g.targetValue === Number(record.target_value)
        );
        
        if (isDuplicate) {
          logger.info('Skipping realtime insert - possible duplicate from local creation:', record.id);
          return;
        }
        
        // Usar updated_at do servidor (TIMESTAMPTZ)
        const serverUpdatedAtMs = new Date(record.updated_at).getTime();
        
        await db.investmentGoals.put({
          id: record.id,
          type: record.type,
          targetValue: Number(record.target_value),
          createdAt: new Date(record.created_at).getTime(),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: serverUpdatedAtMs,
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (!record || record.user_id !== userId) return;
        
        const existing = await db.investmentGoals.get(record.id);
        
        if (existing && existing.syncStatus === 'pending' && !existing.isDeleted) {
          logger.info('Skipping realtime delete - local pending changes exist for:', record.id);
          return;
        }
        
        await db.investmentGoals.delete(record.id);
      }
    } catch (error) {
      logger.error('Error handling realtime goal:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    logger.info('Setting up realtime subscriptions for user:', userId);

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        handleTransactionChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debts',
          filter: `user_id=eq.${userId}`,
        },
        handleDebtChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_goals',
          filter: `user_id=eq.${userId}`,
        },
        handleGoalChange
      )
      .subscribe((status) => {
        logger.info('Realtime subscription status:', status);
      });

    return () => {
      logger.info('Cleaning up realtime subscriptions');
      supabase.removeChannel(channel);
    };
  }, [userId, handleTransactionChange, handleDebtChange, handleGoalChange]);
};

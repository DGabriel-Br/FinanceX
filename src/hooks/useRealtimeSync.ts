import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/offline/database';
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
        
        await db.transactions.put({
          id: record.id,
          type: record.type,
          category: record.category,
          date: record.date,
          description: record.description,
          value: record.value,
          createdAt: Number(record.created_at),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: Date.now(),
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (record.user_id !== userId) return;
        
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
        
        await db.debts.put({
          id: record.id,
          name: record.name,
          totalValue: record.total_value,
          monthlyInstallment: record.monthly_installment,
          startDate: record.start_date,
          paidValue: record.paid_value,
          createdAt: Number(record.created_at),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: Date.now(),
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (record.user_id !== userId) return;
        
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
        
        await db.investmentGoals.put({
          id: record.id,
          type: record.type,
          targetValue: record.target_value,
          createdAt: new Date(record.created_at).getTime(),
          userId: record.user_id,
          syncStatus: 'synced',
          localUpdatedAt: existing?.localUpdatedAt || Date.now(),
          serverUpdatedAt: Date.now(),
          version: (existing?.version || 0) + 1,
        });
      } else if (payload.eventType === 'DELETE') {
        const record = payload.old;
        if (record.user_id !== userId) return;
        
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

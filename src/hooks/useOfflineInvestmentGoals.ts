import { useState, useEffect, useCallback } from 'react';
import { InvestmentType } from '@/types/investment';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalInvestmentGoal } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';

export interface InvestmentGoal {
  type: InvestmentType;
  targetValue: number;
}

export const useOfflineInvestmentGoals = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Observar metas do IndexedDB em tempo real
  const localGoals = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.investmentGoals
        .where('userId')
        .equals(userId)
        .filter(g => !g.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Converter para formato de InvestmentGoal
  const goals: InvestmentGoal[] = (localGoals || []).map(g => ({
    type: g.type as InvestmentType,
    targetValue: g.targetValue,
  }));

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          if (navigator.onLine) {
            await syncService.syncAll();
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Adicionar ou atualizar meta
  const setGoal = useCallback(async (type: InvestmentType, targetValue: number) => {
    try {
      if (!userId) throw new Error('Usuário não autenticado');

      const now = Date.now();
      
      // Verificar se já existe localmente
      const existingLocal = await db.investmentGoals
        .where('userId')
        .equals(userId)
        .filter(g => g.type === type && !g.isDeleted)
        .first();
      
      if (existingLocal) {
        // Atualizar
        await db.investmentGoals.update(existingLocal.id, {
          targetValue,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });

        if (navigator.onLine) {
          const { error } = await supabase
            .from('investment_goals')
            .update({ target_value: targetValue })
            .eq('id', existingLocal.id);

          if (!error) {
            await db.investmentGoals.update(existingLocal.id, {
              syncStatus: 'synced',
              serverUpdatedAt: now,
            });
          }
        }
      } else {
        // Inserir nova
        const tempId = generateTempId();
        
        const localGoal: LocalInvestmentGoal = {
          id: tempId,
          type,
          targetValue,
          createdAt: now,
          userId,
          syncStatus: 'pending',
          localUpdatedAt: now,
        };

        await db.investmentGoals.add(localGoal);

        if (navigator.onLine) {
          const { data, error } = await supabase
            .from('investment_goals')
            .insert({ type, target_value: targetValue, user_id: userId })
            .select()
            .single();

          if (!error && data) {
            await db.investmentGoals.delete(tempId);
            await db.investmentGoals.add({
              ...localGoal,
              id: data.id,
              createdAt: new Date(data.created_at).getTime(),
              syncStatus: 'synced',
              serverUpdatedAt: now,
            });
          }
        }
      }

      toast.success(navigator.onLine ? 'Meta atualizada!' : 'Meta salva localmente');
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta');
    }
  }, [userId]);

  // Remover meta
  const removeGoal = useCallback(async (type: InvestmentType) => {
    try {
      if (!userId) throw new Error('Usuário não autenticado');

      const now = Date.now();
      
      const existingLocal = await db.investmentGoals
        .where('userId')
        .equals(userId)
        .filter(g => g.type === type && !g.isDeleted)
        .first();

      if (existingLocal) {
        await db.investmentGoals.update(existingLocal.id, {
          isDeleted: true,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });

        if (navigator.onLine) {
          const { error } = await supabase
            .from('investment_goals')
            .delete()
            .eq('id', existingLocal.id);

          if (!error) {
            await db.investmentGoals.delete(existingLocal.id);
          }
        }
      }

      toast.success(navigator.onLine ? 'Meta removida!' : 'Remoção salva localmente');
    } catch (error) {
      console.error('Erro ao remover meta:', error);
      toast.error('Erro ao remover meta');
    }
  }, [userId]);

  // Obter meta por tipo
  const getGoal = useCallback((type: InvestmentType): number | undefined => {
    return goals.find(g => g.type === type)?.targetValue;
  }, [goals]);

  const refetch = useCallback(async () => {
    if (navigator.onLine) {
      await syncService.syncAll();
    }
  }, []);

  return {
    goals,
    loading,
    setGoal,
    removeGoal,
    getGoal,
    refetch,
  };
};

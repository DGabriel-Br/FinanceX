import { useState, useEffect, useCallback } from 'react';
import { InvestmentType } from '@/types/investment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvestmentGoal {
  type: InvestmentType;
  targetValue: number;
}

export const useInvestmentGoals = () => {
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar do Supabase ao iniciar
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investment_goals')
        .select('*');

      if (error) throw error;

      const mappedData: InvestmentGoal[] = (data || []).map((g) => ({
        type: g.type as InvestmentType,
        targetValue: Number(g.target_value),
      }));

      setGoals(mappedData);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar ou atualizar meta
  const setGoal = useCallback(async (type: InvestmentType, targetValue: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verifica se já existe
      const existingGoal = goals.find(g => g.type === type);
      
      if (existingGoal) {
        // Atualizar
        const { error } = await supabase
          .from('investment_goals')
          .update({ target_value: targetValue })
          .eq('type', type)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from('investment_goals')
          .insert({ type, target_value: targetValue, user_id: user.id });

        if (error) throw error;
      }

      setGoals(prev => {
        const existing = prev.findIndex(g => g.type === type);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { type, targetValue };
          return updated;
        }
        return [...prev, { type, targetValue }];
      });
      
      toast.success('Meta atualizada!');
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta');
    }
  }, [goals]);

  // Remover meta
  const removeGoal = useCallback(async (type: InvestmentType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('investment_goals')
        .delete()
        .eq('type', type)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.type !== type));
      toast.success('Meta removida!');
    } catch (error) {
      console.error('Erro ao remover meta:', error);
      toast.error('Erro ao remover meta');
    }
  }, []);

  // Obter meta por tipo
  const getGoal = useCallback((type: InvestmentType): number | undefined => {
    return goals.find(g => g.type === type)?.targetValue;
  }, [goals]);

  return {
    goals,
    loading,
    setGoal,
    removeGoal,
    getGoal,
    refetch: fetchGoals,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvestmentGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  isCompleted: boolean;
  createdAt: number;
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: InvestmentGoal[] = (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        targetValue: Number(g.target_value),
        currentValue: Number(g.current_value),
        deadline: g.deadline || undefined,
        isCompleted: g.is_completed,
        createdAt: new Date(g.created_at).getTime(),
      }));

      setGoals(mappedData);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar meta
  const addGoal = useCallback(async (goal: Omit<InvestmentGoal, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('investment_goals')
        .insert({
          name: goal.name,
          target_value: goal.targetValue,
          current_value: goal.currentValue,
          deadline: goal.deadline || null,
          is_completed: goal.isCompleted,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: InvestmentGoal = {
        id: data.id,
        name: data.name,
        targetValue: Number(data.target_value),
        currentValue: Number(data.current_value),
        deadline: data.deadline || undefined,
        isCompleted: data.is_completed,
        createdAt: new Date(data.created_at).getTime(),
      };

      setGoals(prev => [newGoal, ...prev]);
      toast.success('Meta adicionada!');
      return newGoal;
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      toast.error('Erro ao adicionar meta');
      return null;
    }
  }, []);

  // Atualizar meta
  const updateGoal = useCallback(async (id: string, updates: Partial<Omit<InvestmentGoal, 'id' | 'createdAt'>>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
      if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline || null;
      if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

      const { error } = await supabase
        .from('investment_goals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      ));
      toast.success('Meta atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  }, []);

  // Remover meta
  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('investment_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Meta excluída!');
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta');
    }
  }, []);

  // Obter meta por nome (mantendo compatibilidade)
  const getGoal = useCallback((name: string): number | undefined => {
    return goals.find(g => g.name === name)?.targetValue;
  }, [goals]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    refetch: fetchGoals,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types/debt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar do Supabase ao iniciar
  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: Debt[] = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        totalValue: Number(d.total_value),
        monthlyInstallment: Number(d.monthly_installment),
        startDate: d.start_date,
        createdAt: Number(d.created_at),
      }));

      setDebts(mappedData);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      toast.error('Erro ao carregar dívidas');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar dívida
  const addDebt = useCallback(async (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          name: debt.name,
          total_value: debt.totalValue,
          monthly_installment: debt.monthlyInstallment,
          start_date: debt.startDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newDebt: Debt = {
        id: data.id,
        name: data.name,
        totalValue: Number(data.total_value),
        monthlyInstallment: Number(data.monthly_installment),
        startDate: data.start_date,
        createdAt: Number(data.created_at),
      };

      setDebts(prev => [newDebt, ...prev]);
      toast.success('Dívida adicionada!');
      return newDebt;
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
      toast.error('Erro ao adicionar dívida');
      return null;
    }
  }, []);

  // Atualizar dívida
  const updateDebt = useCallback(async (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue;
      if (updates.monthlyInstallment !== undefined) updateData.monthly_installment = updates.monthlyInstallment;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;

      const { error } = await supabase
        .from('debts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.map(debt => 
        debt.id === id ? { ...debt, ...updates } : debt
      ));
      toast.success('Dívida atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar dívida:', error);
      toast.error('Erro ao atualizar dívida');
    }
  }, []);

  // Remover dívida
  const deleteDebt = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.filter(debt => debt.id !== id));
      toast.success('Dívida excluída!');
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      toast.error('Erro ao excluir dívida');
    }
  }, []);

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    refetch: fetchDebts,
  };
};

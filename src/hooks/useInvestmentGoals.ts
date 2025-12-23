import { useState, useEffect, useCallback } from 'react';
import { InvestmentType } from '@/types/investment';

export interface InvestmentGoal {
  type: InvestmentType;
  targetValue: number;
}

const STORAGE_KEY = 'financeiro-pessoal-investment-goals';

export const useInvestmentGoals = () => {
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGoals(parsed);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
      }
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  // Adicionar ou atualizar meta
  const setGoal = useCallback((type: InvestmentType, targetValue: number) => {
    setGoals(prev => {
      const existing = prev.findIndex(g => g.type === type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { type, targetValue };
        return updated;
      }
      return [...prev, { type, targetValue }];
    });
  }, []);

  // Remover meta
  const removeGoal = useCallback((type: InvestmentType) => {
    setGoals(prev => prev.filter(g => g.type !== type));
  }, []);

  // Obter meta por tipo
  const getGoal = useCallback((type: InvestmentType): number | undefined => {
    return goals.find(g => g.type === type)?.targetValue;
  }, [goals]);

  return {
    goals,
    setGoal,
    removeGoal,
    getGoal,
  };
};

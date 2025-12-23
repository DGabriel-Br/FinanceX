import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types/debt';

const DEBTS_STORAGE_KEY = 'finance-debts';

// Carrega dívidas do localStorage
const loadDebts = (): Debt[] => {
  try {
    const stored = localStorage.getItem(DEBTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Salva dívidas no localStorage
const saveDebts = (debts: Debt[]) => {
  localStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(debts));
};

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>(loadDebts);

  // Sincroniza com localStorage
  useEffect(() => {
    saveDebts(debts);
  }, [debts]);

  // Adicionar dívida
  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setDebts(prev => [...prev, newDebt]);
    return newDebt;
  }, []);

  // Atualizar dívida
  const updateDebt = useCallback((id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => {
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, ...updates } : debt
    ));
  }, []);

  // Remover dívida
  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  }, []);

  return {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
  };
};

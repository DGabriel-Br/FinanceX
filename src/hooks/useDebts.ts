import { useState, useEffect, useCallback } from 'react';
import { Debt, DebtPayment } from '@/types/debt';

const DEBTS_STORAGE_KEY = 'finance-debts';
const PAYMENTS_STORAGE_KEY = 'finance-debt-payments';

// Carrega dívidas do localStorage
const loadDebts = (): Debt[] => {
  try {
    const stored = localStorage.getItem(DEBTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Carrega pagamentos do localStorage
const loadPayments = (): DebtPayment[] => {
  try {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Salva dívidas no localStorage
const saveDebts = (debts: Debt[]) => {
  localStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(debts));
};

// Salva pagamentos no localStorage
const savePayments = (payments: DebtPayment[]) => {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
};

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>(loadDebts);
  const [payments, setPayments] = useState<DebtPayment[]>(loadPayments);

  // Sincroniza com localStorage
  useEffect(() => {
    saveDebts(debts);
  }, [debts]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  // Adicionar dívida
  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt' | 'paidValue'>) => {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
      paidValue: 0,
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
    // Remove pagamentos relacionados
    setPayments(prev => prev.filter(payment => payment.debtId !== id));
  }, []);

  // Adicionar pagamento
  const addPayment = useCallback((payment: Omit<DebtPayment, 'id' | 'createdAt'>) => {
    const newPayment: DebtPayment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setPayments(prev => [...prev, newPayment]);
    
    // Atualiza valor pago da dívida
    setDebts(prev => prev.map(debt => 
      debt.id === payment.debtId 
        ? { ...debt, paidValue: debt.paidValue + payment.value }
        : debt
    ));
    
    return newPayment;
  }, []);

  // Remover pagamento
  const deletePayment = useCallback((id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setPayments(prev => prev.filter(p => p.id !== id));
      // Atualiza valor pago da dívida
      setDebts(prev => prev.map(debt => 
        debt.id === payment.debtId 
          ? { ...debt, paidValue: Math.max(0, debt.paidValue - payment.value) }
          : debt
      ));
    }
  }, [payments]);

  // Obter pagamentos de uma dívida
  const getPaymentsForDebt = useCallback((debtId: string) => {
    return payments.filter(p => p.debtId === debtId).sort((a, b) => b.createdAt - a.createdAt);
  }, [payments]);

  // Calcula estatísticas
  const getDebtStats = useCallback(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.totalValue, 0);
    const totalPaid = debts.reduce((sum, debt) => sum + debt.paidValue, 0);
    const totalRemaining = totalDebt - totalPaid;
    const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    
    return {
      totalDebt,
      totalPaid,
      totalRemaining,
      overallProgress,
      count: debts.length,
    };
  }, [debts]);

  return {
    debts,
    payments,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    deletePayment,
    getPaymentsForDebt,
    getDebtStats,
  };
};

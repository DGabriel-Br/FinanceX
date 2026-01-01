/**
 * Funções puras para cálculo de saldo e totais financeiros.
 * Estas funções não dependem de estado ou efeitos colaterais.
 */

import { Transaction } from '@/types/transaction';

export interface FinancialTotals {
  receitas: number;
  despesas: number;
  saldoAnterior: number;
  saldoPeriodo: number;
  saldo: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Calcula o saldo anterior a uma data específica
 */
export const calculatePreviousBalance = (
  transactions: Transaction[],
  beforeDate: Date
): number => {
  const startDate = new Date(beforeDate);
  startDate.setHours(0, 0, 0, 0);

  let balance = 0;
  
  for (const t of transactions) {
    const transactionDate = parseLocalDate(t.date);
    if (transactionDate < startDate) {
      balance += t.type === 'receita' ? t.value : -t.value;
    }
  }
  
  return balance;
};

/**
 * Calcula totais financeiros para um período
 */
export const calculateTotals = (
  transactions: Transaction[],
  allTransactions: Transaction[],
  range: DateRange | null
): FinancialTotals => {
  const previousBalance = range 
    ? calculatePreviousBalance(allTransactions, range.start)
    : 0;

  // Receitas e despesas do período filtrado
  const receitasPeriodo = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  
  const despesasPeriodo = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);
  
  // Se saldo anterior é positivo, soma nas receitas; se negativo, soma nas despesas
  const receitas = receitasPeriodo + (previousBalance > 0 ? previousBalance : 0);
  const despesas = despesasPeriodo + (previousBalance < 0 ? Math.abs(previousBalance) : 0);
  
  const saldoPeriodo = receitasPeriodo - despesasPeriodo;
  
  return {
    receitas,
    despesas,
    saldoAnterior: previousBalance,
    saldoPeriodo,
    saldo: receitas - despesas,
  };
};

/**
 * Calcula o saldo acumulado até o início de um ano
 */
export const calculatePreviousYearBalance = (
  transactions: Transaction[],
  year: number
): number => {
  let balance = 0;
  
  for (const t of transactions) {
    const [transYear] = t.date.split('-');
    if (parseInt(transYear) < year) {
      balance += t.type === 'receita' ? t.value : -t.value;
    }
  }
  
  return balance;
};

/**
 * Calcula dados mensais para gráfico (receitas e despesas por mês)
 * O saldo do ano anterior é aplicado apenas no primeiro mês
 */
export const calculateMonthlyData = (
  transactions: Transaction[],
  year: number,
  previousYearBalance: number
): Array<{
  name: string;
  receitas: number;
  despesas: number;
  month: number;
  isCurrentMonth: boolean;
}> => {
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;

  // Inicializa dados mensais
  const monthlyRaw = MONTHS.map((name, index) => ({
    name,
    receitas: 0,
    despesas: 0,
    month: index,
    isCurrentMonth: isCurrentYear && index === currentMonth,
  }));

  // Agrupa transações por mês
  for (const t of transactions) {
    const [transYear, monthStr] = t.date.split('-');
    if (parseInt(transYear) === year) {
      const monthIndex = parseInt(monthStr) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        if (t.type === 'receita') {
          monthlyRaw[monthIndex].receitas += t.value;
        } else {
          monthlyRaw[monthIndex].despesas += t.value;
        }
      }
    }
  }

  // Aplica saldo do ano anterior apenas no primeiro mês (Janeiro)
  if (previousYearBalance > 0) {
    monthlyRaw[0].receitas += previousYearBalance;
  } else if (previousYearBalance < 0) {
    monthlyRaw[0].despesas += Math.abs(previousYearBalance);
  }

  return monthlyRaw;
};

// Helper para criar Date a partir de string YYYY-MM-DD sem problemas de fuso
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

import { Transaction } from '@/types/transaction';

interface MonthProjection {
  projectedBalance: number;
  daysUntilNegative: number | null;
  dailyAverageExpense: number;
  isPositive: boolean;
  totalIncome: number;
  totalExpenses: number;
  projectedMonthlyExpenses: number;
}

/**
 * Calcula a projeção mensal baseada na renda informada e nos gastos registrados
 */
export function calculateMonthProjection(
  monthlyIncome: number,
  transactions: Transaction[]
): MonthProjection {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  // Filtrar transações do mês atual
  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });

  // Calcular total de despesas do mês
  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  // Calcular total de receitas do mês (além da renda informada no onboarding)
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  // Média diária de gastos (baseada nos dias já passados)
  const dailyAverageExpense = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;

  // Projetar gastos para o mês inteiro
  const projectedMonthlyExpenses = dailyAverageExpense * daysInMonth;

  // Saldo projetado = Renda total - Gastos projetados
  // Renda total = renda informada no onboarding + outras receitas do mês
  const totalMonthlyIncome = monthlyIncome + totalIncome;
  const projectedBalance = totalMonthlyIncome - projectedMonthlyExpenses;

  // Calcular dias até ficar negativo (se aplicável)
  let daysUntilNegative: number | null = null;
  if (dailyAverageExpense > 0 && projectedBalance < 0) {
    // Quanto já foi gasto + quanto ainda pode gastar antes de zerar
    const remainingBudget = totalMonthlyIncome - totalExpenses;
    if (remainingBudget > 0 && dailyAverageExpense > 0) {
      daysUntilNegative = Math.ceil(remainingBudget / dailyAverageExpense);
    } else {
      daysUntilNegative = 0; // Já está negativo
    }
  }

  return {
    projectedBalance,
    daysUntilNegative,
    dailyAverageExpense,
    isPositive: projectedBalance >= 0,
    totalIncome: totalMonthlyIncome,
    totalExpenses,
    projectedMonthlyExpenses,
  };
}

/**
 * Calcula projeção simplificada apenas com renda e um gasto pontual
 * Usado no onboarding para mostrar o saldo restante após o gasto
 */
export function calculateSimpleProjection(
  monthlyIncome: number,
  singleExpenseValue: number
): MonthProjection {
  // Saldo restante após o gasto pontual
  const projectedBalance = monthlyIncome - singleExpenseValue;

  return {
    projectedBalance,
    daysUntilNegative: null, // Não aplicável para gasto pontual
    dailyAverageExpense: 0,
    isPositive: projectedBalance >= 0,
    totalIncome: monthlyIncome,
    totalExpenses: singleExpenseValue,
    projectedMonthlyExpenses: singleExpenseValue,
  };
}

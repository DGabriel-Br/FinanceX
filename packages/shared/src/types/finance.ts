export type TransactionType = 'receita' | 'despesa';

export type IncomeCategory =
  | 'salario'
  | '13_salario'
  | 'ferias'
  | 'freelance'
  | 'outros_receita';

export type ExpenseCategory =
  | 'contas_fixas'
  | 'investimentos'
  | 'dividas'
  | 'educacao'
  | 'transporte'
  | 'mercado'
  | 'delivery'
  | 'outros_despesa';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description: string;
  value: number;
  createdAt: number;
}

export interface Debt {
  id: string;
  name: string;
  totalValue: number;
  monthlyInstallment: number;
  startDate: string;
  paidValue: number;
  createdAt: number;
}

export type InvestmentType =
  | 'reserva_emergencia'
  | 'acoes'
  | 'fundos_imobiliarios'
  | 'renda_fixa'
  | 'tesouro_direto'
  | 'criptomoedas'
  | 'outros_investimentos';

export interface InvestmentGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline?: string | null;
  createdAt: number;
}

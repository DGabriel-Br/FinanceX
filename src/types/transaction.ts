// Tipos para transações financeiras

export type TransactionType = 'receita' | 'despesa';

// Categorias de Receita
export type IncomeCategory = 
  | 'salario'
  | '13_salario'
  | 'ferias'
  | 'freelance'
  | 'outros_receita';

// Categorias de Despesa
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

// Labels para exibição
export const incomeCategoryLabels: Record<IncomeCategory, string> = {
  salario: 'Salário',
  '13_salario': '13\u00BA Salário',
  ferias: 'Férias',
  freelance: 'Freelance',
  outros_receita: 'Outros',
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  contas_fixas: 'Contas Fixas Mensais',
  investimentos: 'Investimentos',
  dividas: 'Dívidas',
  educacao: 'Educação',
  transporte: 'Transporte',
  mercado: 'Mercado',
  delivery: 'Delivery',
  outros_despesa: 'Outros',
};

// Helper para obter label de categoria
export const getCategoryLabel = (category: TransactionCategory, type: TransactionType): string => {
  if (type === 'receita') {
    return incomeCategoryLabels[category as IncomeCategory] || category;
  }
  return expenseCategoryLabels[category as ExpenseCategory] || category;
};

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // formato YYYY-MM-DD
  description: string;
  value: number;
  createdAt: number;
}

export type PeriodFilter = 'dia' | 'semana' | 'mes' | 'ano' | 'todos';

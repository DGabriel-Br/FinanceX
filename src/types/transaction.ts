// Tipos para transações financeiras
import { 
  Wallet, 
  Gift, 
  Plane, 
  Briefcase, 
  MoreHorizontal,
  Receipt,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Car,
  ShoppingCart,
  UtensilsCrossed,
  LucideIcon
} from 'lucide-react';

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
  '13_salario': '13\u00BA Sal\u00E1rio',
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

// Ícones para categorias
export const incomeCategoryIcons: Record<IncomeCategory, LucideIcon> = {
  salario: Wallet,
  '13_salario': Gift,
  ferias: Plane,
  freelance: Briefcase,
  outros_receita: MoreHorizontal,
};

export const expenseCategoryIcons: Record<ExpenseCategory, LucideIcon> = {
  contas_fixas: Receipt,
  investimentos: TrendingUp,
  dividas: CreditCard,
  educacao: GraduationCap,
  transporte: Car,
  mercado: ShoppingCart,
  delivery: UtensilsCrossed,
  outros_despesa: MoreHorizontal,
};

// Helper para obter label de categoria
export const getCategoryLabel = (category: TransactionCategory, type: TransactionType): string => {
  if (type === 'receita') {
    return incomeCategoryLabels[category as IncomeCategory] || category;
  }
  return expenseCategoryLabels[category as ExpenseCategory] || category;
};

// Helper para obter ícone de categoria
export const getCategoryIcon = (category: TransactionCategory, type: TransactionType): LucideIcon => {
  if (type === 'receita') {
    return incomeCategoryIcons[category as IncomeCategory] || MoreHorizontal;
  }
  return expenseCategoryIcons[category as ExpenseCategory] || MoreHorizontal;
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

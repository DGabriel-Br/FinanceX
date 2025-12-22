// Tipos para transações financeiras

export type TransactionType = 'receita' | 'despesa';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // formato YYYY-MM-DD
  description: string;
  value: number;
  createdAt: number;
}

export type PeriodFilter = 'dia' | 'semana' | 'mes' | 'ano' | 'todos';

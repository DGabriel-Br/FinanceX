// Tipos para dívidas
export interface Debt {
  id: string;
  name: string;
  totalValue: number;
  paidValue: number;
  expectedEndDate: string; // formato YYYY-MM
  createdAt: number;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  value: number;
  date: string; // formato YYYY-MM-DD
  createdAt: number;
}

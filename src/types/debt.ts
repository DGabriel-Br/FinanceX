// Tipos para dívidas
export interface Debt {
  id: string;
  name: string;
  totalValue: number;
  monthlyInstallment: number;
  startDate: string; // formato YYYY-MM
  paidValue: number; // valor já pago
  createdAt: number;
}

// Helper para calcular previsão de término
export const calculateExpectedEndDate = (
  totalValue: number,
  monthlyInstallment: number,
  startDate: string,
  paidValue: number
): string => {
  if (monthlyInstallment <= 0) return startDate;
  
  const remaining = totalValue - paidValue;
  if (remaining <= 0) return startDate;
  
  const monthsRemaining = Math.ceil(remaining / monthlyInstallment);
  
  const [year, month] = startDate.split('-').map(Number);
  const startDateObj = new Date(year, month - 1);
  
  // Calcula quantos meses já passaram desde o início
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth());
  
  // Meses desde o início até agora
  const monthsElapsed = (currentMonth.getFullYear() - startDateObj.getFullYear()) * 12 
    + (currentMonth.getMonth() - startDateObj.getMonth());
  
  // Previsão de término = data atual + meses restantes
  const endDate = new Date(currentMonth);
  endDate.setMonth(endDate.getMonth() + monthsRemaining);
  
  const endYear = endDate.getFullYear();
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
  
  return `${endYear}-${endMonth}`;
};

// Helper para calcular progresso
export const calculateProgress = (totalValue: number, paidValue: number): number => {
  if (totalValue <= 0) return 0;
  return Math.min(100, (paidValue / totalValue) * 100);
};

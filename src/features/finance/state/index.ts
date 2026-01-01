// Shim de compatibilidade - reexportando state de finance
// Este arquivo permite que importações de @/features/finance/state funcionem
// enquanto o arquivo original permanece em src/contexts

export { FinanceDataProvider, useFinanceData } from '@/contexts/FinanceDataContext';

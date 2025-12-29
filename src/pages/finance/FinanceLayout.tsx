import { Outlet } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { FinanceDataProvider, useFinanceData } from '@/contexts/FinanceDataContext';

// Componente interno que usa o contexto
const FinanceLayoutContent = () => {
  const { refreshAll, addTransaction } = useFinanceData();

  return (
    <AppShell onRefresh={refreshAll} onAddTransaction={addTransaction}>
      <Outlet />
    </AppShell>
  );
};

// Wrapper que provê o contexto
const FinanceLayout = () => {
  return (
    <FinanceDataProvider>
      <FinanceLayoutContent />
    </FinanceDataProvider>
  );
};

export default FinanceLayout;

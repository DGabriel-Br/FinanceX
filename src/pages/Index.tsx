import { useState } from 'react';
import { Sidebar } from '@/components/finance/Sidebar';
import { Dashboard } from '@/components/finance/Dashboard';
import { Transactions } from '@/components/finance/Transactions';
import { Debts } from '@/components/finance/Debts';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useTheme } from '@/hooks/useTheme';

type Tab = 'dashboard' | 'lancamentos' | 'dividas';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const {
    filter,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getTotals,
  } = useTransactions();

  const {
    debts,
    addDebt,
    deleteDebt,
    addPayment,
    deletePayment,
    getPaymentsForDebt,
  } = useDebts();

  const filteredTransactions = getFilteredTransactions();
  const totals = getTotals();

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar fixa */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto bg-background">
        {activeTab === 'dashboard' ? (
          <Dashboard
            totals={totals}
            filter={filter}
            onFilterChange={setFilter}
            transactions={filteredTransactions}
            debts={debts}
            onNavigateToDebts={() => setActiveTab('dividas')}
          />
        ) : activeTab === 'lancamentos' ? (
          <Transactions
            transactions={filteredTransactions}
            filter={filter}
            onFilterChange={setFilter}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        ) : (
          <Debts
            debts={debts}
            onAddDebt={addDebt}
            onDeleteDebt={deleteDebt}
            onAddPayment={addPayment}
            onDeletePayment={deletePayment}
            getPaymentsForDebt={getPaymentsForDebt}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

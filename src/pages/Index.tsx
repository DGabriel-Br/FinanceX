import { useState } from 'react';
import { Sidebar } from '@/components/finance/Sidebar';
import { Dashboard } from '@/components/finance/Dashboard';
import { Transactions } from '@/components/finance/Transactions';
import { Debts } from '@/components/finance/Debts';
import { Investments } from '@/components/finance/Investments';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useTheme } from '@/hooks/useTheme';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const {
    transactions,
    customRange,
    setCustomRange,
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
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            transactions={filteredTransactions}
            allTransactions={transactions}
            debts={debts}
            onNavigateToDebts={() => setActiveTab('dividas')}
          />
        ) : activeTab === 'lancamentos' ? (
          <Transactions
            transactions={filteredTransactions}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        ) : activeTab === 'investimentos' ? (
          <Investments
            transactions={filteredTransactions}
            allTransactions={transactions}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            onNavigateToTransactions={() => setActiveTab('lancamentos')}
          />
        ) : (
          <Debts
            debts={debts}
            transactions={transactions}
            onAddDebt={addDebt}
            onDeleteDebt={deleteDebt}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

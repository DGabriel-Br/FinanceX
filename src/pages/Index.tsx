import { useState } from 'react';
import { Sidebar } from '@/components/finance/Sidebar';
import { Dashboard } from '@/components/finance/Dashboard';
import { Transactions } from '@/components/finance/Transactions';
import { useTransactions } from '@/hooks/useTransactions';
import { useTheme } from '@/hooks/useTheme';

type Tab = 'dashboard' | 'lancamentos';

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

  const filteredTransactions = getFilteredTransactions();
  const totals = getTotals();

  return (
    <div className="flex min-h-screen w-full">
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
          />
        ) : (
          <Transactions
            transactions={filteredTransactions}
            filter={filter}
            onFilterChange={setFilter}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

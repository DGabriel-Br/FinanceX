import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/finance/Sidebar';
import { MobileNav } from '@/components/finance/MobileNav';
import { Dashboard } from '@/components/finance/Dashboard';
import { Transactions } from '@/components/finance/Transactions';
import { Debts } from '@/components/finance/Debts';
import { Investments } from '@/components/finance/Investments';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

const getTabFromPath = (pathname: string): Tab => {
  const path = pathname.replace('/', '') as Tab;
  if (['dashboard', 'lancamentos', 'dividas', 'investimentos'].includes(path)) {
    return path;
  }
  return 'dashboard';
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getTabFromPath(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const {
    transactions,
    loading: transactionsLoading,
    customRange,
    setCustomRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getTotals,
    refetch: refetchTransactions,
  } = useTransactions();

  const {
    debts,
    loading: debtsLoading,
    addDebt,
    updateDebt,
    deleteDebt,
    refetch: refetchDebts,
  } = useDebts();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Recarregar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      refetchTransactions();
      refetchDebts();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredTransactions = getFilteredTransactions();
  const totals = getTotals();

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar - apenas desktop */}
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
          userEmail={user.email}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
        <div key={activeTab} className="animate-fade-in" style={{ animationDuration: '0.3s' }}>
          {activeTab === 'dashboard' ? (
            <Dashboard
              totals={totals}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              transactions={filteredTransactions}
              allTransactions={transactions}
              debts={debts}
              onNavigateToDebts={() => navigate('/dividas')}
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
              onNavigateToTransactions={() => navigate('/lancamentos')}
              onAddTransaction={addTransaction}
            />
          ) : (
            <Debts
              debts={debts}
              transactions={transactions}
              onAddDebt={addDebt}
              onUpdateDebt={updateDebt}
              onDeleteDebt={deleteDebt}
            />
          )}
        </div>
      </main>

      {/* Navegação Mobile - apenas mobile */}
      <MobileNav 
        activeTab={activeTab} 
        theme={theme}
        onToggleTheme={toggleTheme}
        userEmail={user.email}
        onSignOut={handleSignOut}
      />
    </div>
  );
};

export default Index;

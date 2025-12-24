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
import { useValuesVisibility } from '@/hooks/useValuesVisibility';
import logoDark from '@/assets/logo.jpg';
import logoLight from '@/assets/logo-transparent.png';

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
  const [showSplash, setShowSplash] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const { showValues, toggleValuesVisibility, formatValue } = useValuesVisibility();

  // Tempo mínimo de exibição da splash screen (1.5 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
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

  if (authLoading || showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        {/* Logo animada */}
        <div className="relative mb-6">
          <img src={logoDark} alt="FinanceX" className="w-20 h-20 rounded-2xl animate-pulse object-cover" />
          {/* Anel de loading ao redor do logo */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-3 rounded-3xl border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        
        {/* Nome do app */}
        <h1 className="text-xl font-semibold text-foreground mb-2 animate-fade-in">
          FinanceX
        </h1>
        <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Carregando seu controle financeiro...
        </p>
        
        {/* Barra de progresso */}
        <div className="w-48 h-1 bg-muted rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-income to-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
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
              showValues={showValues}
              onToggleValues={toggleValuesVisibility}
              formatValue={formatValue}
            />
          ) : activeTab === 'lancamentos' ? (
            <Transactions
              transactions={filteredTransactions}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              onAdd={addTransaction}
              onUpdate={updateTransaction}
              onDelete={deleteTransaction}
              formatValue={formatValue}
            />
          ) : activeTab === 'investimentos' ? (
            <Investments
              transactions={filteredTransactions}
              allTransactions={transactions}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              onNavigateToTransactions={() => navigate('/lancamentos')}
              onAddTransaction={addTransaction}
              formatValue={formatValue}
            />
          ) : (
            <Debts
              debts={debts}
              transactions={transactions}
              onAddDebt={addDebt}
              onUpdateDebt={updateDebt}
              onDeleteDebt={deleteDebt}
              formatValue={formatValue}
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

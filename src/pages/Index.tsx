import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/finance/Sidebar';
import { Dashboard } from '@/components/finance/Dashboard';
import { Transactions } from '@/components/finance/Transactions';
import { Debts } from '@/components/finance/Debts';
import { Investments } from '@/components/finance/Investments';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/contexts/AuthContext';
import { useValuesVisibility } from '@/hooks/useValuesVisibility';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuthContext();
  const { showValues, toggleValuesVisibility, formatValue } = useValuesVisibility();
  const { showTour, completeTour, skipTour } = useOnboarding(user?.id);

  // IMPORTANTE: Todos os hooks devem ser chamados antes de qualquer early return
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

  // Tempo mínimo de exibição da splash screen (1.5 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Recarregar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      refetchTransactions();
      refetchDebts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSignOutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const handleSignOutConfirm = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    await signOut();
    // Aguarda 3s para exibir a tela de logout
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);
  };

  if (authLoading || showSplash || isLoggingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        {/* Logo animada */}
        <div className="relative mb-6">
          <div className="relative flex items-end">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-2xl blur-2xl animate-pulse" />
            <FinanceLogo size={48} className="relative" />
            <span 
              className="text-3xl font-black tracking-tight text-foreground -ml-1 relative"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </div>
          {/* Anel de loading ao redor do logo */}
          <div className="absolute -inset-4 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-5 rounded-3xl border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        
        <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoggingOut ? 'Saindo...' : 'Carregando seu controle financeiro...'}
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
    <>
      <div className="flex min-h-screen w-full relative">
        {/* Sidebar - desktop */}
        <Sidebar 
          activeTab={activeTab} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
          userName={user.user_metadata?.full_name}
          userEmail={user.email}
          userAvatar={user.user_metadata?.avatar_url}
          onSignOut={handleSignOutRequest}
        />

        {/* Conteúdo principal */}
        <main className="flex-1 flex flex-col overflow-auto bg-background">
          <div key={activeTab} className="animate-fade-in flex-1" style={{ animationDuration: '0.3s' }}>
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
                showValues={showValues}
                onToggleValues={toggleValuesVisibility}
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
                showValues={showValues}
                onToggleValues={toggleValuesVisibility}
              />
            ) : (
              <Debts
                debts={debts}
                transactions={transactions}
                onAddDebt={addDebt}
                onUpdateDebt={updateDebt}
                onDeleteDebt={deleteDebt}
                formatValue={formatValue}
                showValues={showValues}
                onToggleValues={toggleValuesVisibility}
              />
            )}
          </div>
        </main>
      </div>

      {/* Tour de onboarding para novos usuários */}
      {showTour && (
        <OnboardingTour 
          onComplete={completeTour} 
          onSkip={skipTour} 
        />
      )}

      {/* Diálogo de confirmação de logout */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e precisará fazer login novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutConfirm} className="bg-expense hover:bg-expense/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;

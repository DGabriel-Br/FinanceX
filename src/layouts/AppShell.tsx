import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useNavigationBar } from '@/hooks/useNavigationBar';
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

import {
  AppShellSyncManager,
  AppShellLayout,
  AppShellNavigationHeader,
  AppShellMobileFooter,
  AppShellOnboardingGate,
  AppShellLoadingScreen,
} from './app-shell';

type Tab = 'dashboard' | 'lancamentos' | 'investimentos' | 'dividas';

const tabOrder: Tab[] = ['dashboard', 'lancamentos', 'investimentos', 'dividas'];

const getTabFromPath = (pathname: string): Tab => {
  const path = pathname.replace('/', '') as Tab;
  if (tabOrder.includes(path)) {
    return path;
  }
  return 'dashboard';
};

const getTabIndex = (tab: Tab): number => tabOrder.indexOf(tab);

interface AppShellProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  onAddTransaction?: (transaction: any) => Promise<void>;
}

export const AppShell = ({ children, onRefresh, onAddTransaction }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getTabFromPath(location.pathname);
  const [prevTab, setPrevTab] = useState<Tab>(activeTab);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Detecta direção da navegação entre abas
  useEffect(() => {
    if (activeTab !== prevTab) {
      const prevIndex = getTabIndex(prevTab);
      const newIndex = getTabIndex(activeTab);
      setSlideDirection(newIndex > prevIndex ? 'left' : 'right');
      setPrevTab(activeTab);
    }
  }, [activeTab, prevTab]);

  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signOut, refreshUser } = useAuthContext();
  const { showValues, toggleValuesVisibility } = useFinanceData();
  const isNativeApp = useIsNativeApp();
  
  // Configura a cor da barra de navegação do Android
  useNavigationBar(theme);

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

  // Pull to refresh handler
  const handlePullRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
    await refreshUser();
  }, [onRefresh, refreshUser]);

  const handleSignOutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const handleSignOutConfirm = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    await signOut();
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);
  };

  // Estados de loading
  if (authLoading || showSplash || isLoggingOut) {
    return (
      <AppShellLoadingScreen 
        message={isLoggingOut ? 'Saindo...' : 'Carregando seu controle financeiro...'} 
      />
    );
  }

  if (!user) {
    return null;
  }

  // Handler para adicionar transação (usado pelo onboarding)
  const handleAddTransactionForOnboarding = async (transaction: any) => {
    if (onAddTransaction) {
      await onAddTransaction(transaction);
    }
  };

  return (
    <>
      {/* Gerenciador de Sync - não renderiza nada visualmente */}
      <AppShellSyncManager userId={user.id} />

      {/* Layout principal com navegação e conteúdo */}
      <AppShellLayout
        isNativeApp={isNativeApp}
        activeTab={activeTab}
        slideDirection={slideDirection}
        onPullRefresh={handlePullRefresh}
        navigationSlot={
          <AppShellNavigationHeader
            isNativeApp={isNativeApp}
            activeTab={activeTab}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            theme={theme}
            onToggleTheme={toggleTheme}
            user={user}
            showValues={showValues}
            onToggleValues={toggleValuesVisibility}
            onSignOut={handleSignOutRequest}
            highlightedTab={null}
          />
        }
        mobileNavSlot={
          isNativeApp ? (
            <AppShellMobileFooter
              activeTab={activeTab}
              theme={theme}
              onToggleTheme={toggleTheme}
              userEmail={user.email}
              onSignOut={handleSignOutRequest}
              highlightedTab={null}
            />
          ) : null
        }
      >
        {children}
      </AppShellLayout>

      {/* Onboarding focado em ação */}
      <AppShellOnboardingGate
        userId={user.id}
        onAddTransaction={handleAddTransactionForOnboarding}
      >
        {null}
      </AppShellOnboardingGate>

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

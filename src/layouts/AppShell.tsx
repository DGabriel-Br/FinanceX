import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/finance/Sidebar';
import { MobileHeader } from '@/components/finance/MobileHeader';
import { MobileNav } from '@/components/finance/MobileNav';
import { FloatingAddButton } from '@/components/finance/FloatingAddButton';
import { PullToRefresh } from '@/components/finance/PullToRefresh';
import { OfflineModal } from '@/components/finance/OfflineModal';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useValuesVisibility } from '@/hooks/useValuesVisibility';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useNavigationBar } from '@/hooks/useNavigationBar';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { syncService } from '@/lib/offline/syncService';
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
  const [tourHighlightedTab, setTourHighlightedTab] = useState<Tab | null>(null);

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
  const { isAdmin } = useAdminRole();
  const { showValues, toggleValuesVisibility } = useValuesVisibility();
  const { showTour, completeTour, skipTour } = useOnboarding(user?.id);
  const isNativeApp = useIsNativeApp();
  
  // Configura a cor da barra de navegação do Android
  useNavigationBar(theme);
  
  // Ativa sincronização em tempo real com o servidor
  useRealtimeSync();

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

  // Sincronizar quando o usuário logar
  useEffect(() => {
    if (user && navigator.onLine) {
      syncService.syncAll();
    }
  }, [user?.id]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative mb-6">
          <div className="relative flex items-end">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-2xl blur-2xl animate-pulse" />
            <FinanceLogo size={48} className="relative" />
            <span 
              className="text-3xl font-black tracking-wider text-foreground -ml-1 relative"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </div>
          <div className="absolute -inset-4 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-5 rounded-3xl border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        
        <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoggingOut ? 'Saindo...' : 'Carregando seu controle financeiro...'}
        </p>
        
        <div className="w-48 h-1 bg-muted rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-income to-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {isNativeApp && <OfflineModal />}
      
      <div className={`flex ${isNativeApp ? 'flex-col' : ''} min-h-screen w-full relative`}>
        {/* Sidebar - desktop */}
        {!isNativeApp && (
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
            isAdmin={isAdmin}
            highlightedTab={showTour ? tourHighlightedTab : null}
          />
        )}

        {/* Mobile Header */}
        {isNativeApp && (
          <MobileHeader
            userName={user.user_metadata?.full_name}
            userEmail={user.email}
            userAvatar={user.user_metadata?.avatar_url}
            showValues={showValues}
            onToggleValues={toggleValuesVisibility}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Conteúdo principal */}
        <main 
          className={cn(
            "flex-1 flex flex-col overflow-auto overflow-x-hidden",
            isNativeApp ? "pb-mobile-nav bg-background" : "bg-background"
          )}
        >
          {isNativeApp ? (
            <PullToRefresh onRefresh={handlePullRefresh} className="flex-1">
              <div 
                key={activeTab} 
                className={cn(
                  "flex-1 max-w-full",
                  slideDirection === 'left' && "animate-slide-in-right",
                  slideDirection === 'right' && "animate-slide-in-left",
                  slideDirection === 'none' && "animate-fade-in"
                )}
              >
                {children}
              </div>
            </PullToRefresh>
          ) : (
            <div 
              key={activeTab} 
              className={cn(
                "flex-1 max-w-full",
                slideDirection === 'left' && "animate-slide-in-right",
                slideDirection === 'right' && "animate-slide-in-left",
                slideDirection === 'none' && "animate-fade-in"
              )}
            >
              {children}
            </div>
          )}
        </main>

        {/* Mobile Navigation */}
        {isNativeApp && (
          <>
            {onAddTransaction && <FloatingAddButton onAddTransaction={onAddTransaction} />}
            <MobileNav
              activeTab={activeTab}
              theme={theme}
              onToggleTheme={toggleTheme}
              userEmail={user.email}
              onSignOut={handleSignOutRequest}
              highlightedTab={showTour ? tourHighlightedTab : null}
            />
          </>
        )}
      </div>

      {/* Tour de onboarding */}
      {showTour && (
        <OnboardingTour 
          onComplete={completeTour} 
          onSkip={skipTour}
          onStepChange={setTourHighlightedTab}
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

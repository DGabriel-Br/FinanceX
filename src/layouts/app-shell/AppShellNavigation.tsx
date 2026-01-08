import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/finance/Sidebar';
import { MobileHeader } from '@/components/finance/MobileHeader';
import { MobileNav } from '@/components/finance/MobileNav';
import { FloatingAddButton } from '@/components/finance/FloatingAddButton';

type Tab = 'dashboard' | 'lancamentos' | 'investimentos' | 'dividas';
type Theme = 'light' | 'dark';

interface AppShellNavigationHeaderProps {
  isNativeApp: boolean;
  activeTab: Tab;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  user: User;
  showValues: boolean;
  onToggleValues: () => void;
  onSignOut: () => void;
  highlightedTab: Tab | null;
}

interface AppShellMobileFooterProps {
  activeTab: Tab;
  theme: Theme;
  onToggleTheme: () => void;
  userEmail: string | undefined;
  onSignOut: () => void;
  highlightedTab: Tab | null;
  onAddTransaction?: (transaction: any) => Promise<void>;
}

/**
 * Sidebar (desktop) ou MobileHeader (mobile)
 */
export const AppShellNavigationHeader = ({
  isNativeApp,
  activeTab,
  sidebarCollapsed,
  onToggleSidebar,
  theme,
  onToggleTheme,
  user,
  showValues,
  onToggleValues,
  onSignOut,
  highlightedTab,
}: AppShellNavigationHeaderProps) => {
  if (isNativeApp) {
    return (
      <MobileHeader
        userName={user.user_metadata?.full_name}
        userEmail={user.email}
        userAvatar={user.user_metadata?.avatar_url}
        showValues={showValues}
        onToggleValues={onToggleValues}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  return (
    <Sidebar 
      activeTab={activeTab} 
      collapsed={sidebarCollapsed}
      onToggleCollapse={onToggleSidebar}
      theme={theme}
      onToggleTheme={onToggleTheme}
      userName={user.user_metadata?.full_name}
      userEmail={user.email}
      userAvatar={user.user_metadata?.avatar_url}
      onSignOut={onSignOut}
      highlightedTab={highlightedTab}
    />
  );
};

/**
 * Footer mobile: FloatingAddButton + MobileNav
 */
export const AppShellMobileFooter = ({
  activeTab,
  theme,
  onToggleTheme,
  userEmail,
  onSignOut,
  highlightedTab,
  onAddTransaction,
}: AppShellMobileFooterProps) => {
  return (
    <>
      {onAddTransaction && <FloatingAddButton onAddTransaction={onAddTransaction} />}
      <MobileNav
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={onToggleTheme}
        userEmail={userEmail}
        onSignOut={onSignOut}
        highlightedTab={highlightedTab}
      />
    </>
  );
};

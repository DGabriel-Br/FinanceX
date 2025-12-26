import { LayoutDashboard, Receipt, ChevronLeft, ChevronRight, Moon, Sun, CreditCard, TrendingUp, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { getInitials, getDisplayName } from '@/lib/userUtils';
type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

export interface SidebarProps {
  activeTab: Tab;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onSignOut?: () => void;
}

const menuItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt, tourId: 'transactions' },
  { id: 'investimentos' as Tab, label: 'Controle de Investimentos', icon: TrendingUp, tourId: 'investments' },
  { id: 'dividas' as Tab, label: 'Controle de Dívidas', icon: CreditCard, tourId: 'debts' },
];

export const Sidebar = ({ 
  activeTab, 
  collapsed, 
  onToggleCollapse,
  theme,
  onToggleTheme,
  userName,
  userEmail,
  userAvatar,
  onSignOut
}: SidebarProps) => {
  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-300 ease-in-out relative h-screen sticky top-0",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Botão de colapso posicionado na borda direita */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md border-2 border-background"
      >
        <div className="w-3.5 h-3.5 flex items-center justify-center">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Header com Logo */}
      <div className="px-4 pt-6 pb-6 flex justify-center">
        {/* Logo com efeito de destaque */}
        <div className="relative flex items-end flex-shrink-0 group">
          {/* Glow effect background */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -inset-1 bg-gradient-to-r from-income/10 via-primary/15 to-income/10 rounded-lg blur-md animate-pulse" />
          
          <FinanceLogo size={collapsed ? 36 : 32} className="relative drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
          {!collapsed && (
            <span 
              className="text-2xl font-black tracking-wider text-white -ml-0.5 relative drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 overflow-hidden">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <Link
                  to={`/${item.id}`}
                  title={collapsed ? item.label : undefined}
                  data-tour={item.tourId}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer com User e Theme Toggle */}
      <div className="p-3 mt-auto border-t border-sidebar-border space-y-2">
        {/* User Info - Enhanced design */}
        {(userName || userEmail) && (
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 via-sidebar-accent/60 to-sidebar-accent/40 border border-primary/10 shadow-sm',
              'transition-all duration-300 ease-out cursor-default',
              'hover:from-primary/20 hover:via-sidebar-accent/80 hover:to-sidebar-accent/60',
              'hover:border-primary/30 hover:shadow-md hover:shadow-primary/10',
              'hover:scale-[1.02] hover:-translate-y-0.5',
              collapsed && 'justify-center px-2 py-2'
            )}
          >
            <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20 overflow-hidden transition-all duration-300 hover:ring-primary/40 hover:ring-offset-1 hover:ring-offset-sidebar">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">{getInitials(userName, userEmail)}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-income rounded-full border-2 border-sidebar animate-pulse" title="Online" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium mb-0.5">Logado como</p>
                <p className="text-sm text-primary font-semibold truncate uppercase tracking-wide">{getDisplayName(userName, userEmail)}</p>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <div
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className={cn(
              "flex items-center gap-3",
              collapsed ? "justify-center" : "flex-1"
            )}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-sidebar-foreground/80 flex-shrink-0" />
            ) : (
              <Sun className="w-5 h-5 text-sidebar-foreground/80 flex-shrink-0" />
            )}
            
            {!collapsed && (
              <span className="text-sm text-sidebar-foreground/80 flex-1 text-left">
                {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
              </span>
            )}
          </button>
          
          {!collapsed && (
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={onToggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          )}
        </div>

        {/* Settings Button */}
        <Link
          to="/settings"
          title="Configurações"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>

        {/* Logout Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sair"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-expense/10 hover:text-expense',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

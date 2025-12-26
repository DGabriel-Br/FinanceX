import { LayoutDashboard, Receipt, ChevronLeft, ChevronRight, Moon, Sun, CreditCard, TrendingUp, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import logo from '@/assets/logo.png';

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
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Controle de Investimentos', icon: TrendingUp },
  { id: 'dividas' as Tab, label: 'Controle de Dívidas', icon: CreditCard },
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
      <div className={cn(
        "p-4 flex items-center",
        collapsed ? "justify-center" : "gap-3"
      )}>
        {/* Logo */}
        <img src={logo} alt="FinanceX" className="w-10 h-10 rounded-lg flex-shrink-0 object-cover" />
        
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-primary-foreground truncate">
              FinanceX
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">Controle Financeiro</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 mt-4 overflow-hidden">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <Link
                  to={`/${item.id}`}
                  title={collapsed ? item.label : undefined}
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
              collapsed && 'justify-center px-2 py-2'
            )}
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20 overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-income rounded-full border-2 border-sidebar" title="Online" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium mb-0.5">Logado como</p>
                <p className="text-xs text-sidebar-foreground/90 truncate font-medium uppercase">{userName || userEmail}</p>
              </div>
            )}
          </div>
        )}

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

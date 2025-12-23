import { LayoutDashboard, Receipt, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

type Tab = 'dashboard' | 'lancamentos';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const menuItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
];

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  collapsed, 
  onToggleCollapse,
  theme,
  onToggleTheme
}: SidebarProps) => {
  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Botão de colapso posicionado na borda direita */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md border-2 border-background"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header com Logo */}
      <div className={cn(
        "p-4 flex items-center",
        collapsed ? "justify-center" : "gap-3"
      )}>
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
          FN
        </div>
        
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-primary-foreground truncate">
              Finanças
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">Controle Pessoal</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 mt-4">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer com Theme Toggle */}
      <div className="p-3 mt-auto border-t border-sidebar-border">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-sidebar-foreground/80 flex-shrink-0" />
          ) : (
            <Sun className="w-5 h-5 text-sidebar-foreground/80 flex-shrink-0" />
          )}
          
          {!collapsed && (
            <>
              <span className="text-sm text-sidebar-foreground/80 flex-1 text-left">
                {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
              </span>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={onToggleTheme}
                className="data-[state=checked]:bg-primary"
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

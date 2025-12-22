import { LayoutDashboard, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'lancamentos';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const menuItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-primary-foreground">
          💰 Finanças
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Controle Pessoal</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Dados salvos localmente
        </p>
      </div>
    </aside>
  );
};

import { LayoutDashboard, Receipt, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Investimentos', icon: TrendingUp },
  { id: 'dividas' as Tab, label: 'Dívidas', icon: CreditCard },
];

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
              <span className={cn(
                'text-[10px] font-medium truncate max-w-[60px]',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
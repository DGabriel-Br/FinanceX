import { Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

export interface MobileNavProps {
  activeTab: Tab;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut?: () => void;
  highlightedTab?: Tab | null; // Tab a ser destacada durante o tour
}

// Ordem: Dashboard, Lançamentos, Investimentos, Dívidas
const navItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Investimentos', icon: TrendingUp },
  { id: 'dividas' as Tab, label: 'Dívidas', icon: CreditCard },
];

export const MobileNav = ({ activeTab, highlightedTab }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 border-t border-border">
        {navItems.map((item) => {
          // Se há um highlightedTab (durante o tour), usa ele; senão, usa activeTab
          const isHighlighted = highlightedTab ? highlightedTab === item.id : activeTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              data-tour={item.id}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isHighlighted
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isHighlighted && 'scale-110 transition-transform')} />
              <span className={cn(
                'text-[10px] font-medium truncate max-w-[60px]',
                isHighlighted && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
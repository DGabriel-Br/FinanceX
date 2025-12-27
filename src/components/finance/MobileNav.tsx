import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, CreditCard, TrendingUp, Settings, Moon, Sun, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

export interface MobileNavProps {
  activeTab: Tab;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

// Itens reorganizados: Dashboard no centro
const navItemsLeft = [
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Investimentos', icon: TrendingUp },
];

const navItemCenter = { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard };

const navItemsRight = [
  { id: 'dividas' as Tab, label: 'Dívidas', icon: CreditCard },
];

export const MobileNav = ({ activeTab, theme, onToggleTheme, userEmail, onSignOut }: MobileNavProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2 bg-card border-t border-border">

          {/* Itens da esquerda */}
          {navItemsLeft.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
                <span className={cn(
                  'text-[10px] font-medium truncate max-w-[60px]',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Dashboard no centro - destaque */}
          <Link
            to={`/${navItemCenter.id}`}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
              activeTab === navItemCenter.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-all',
              activeTab === navItemCenter.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              <navItemCenter.icon className="w-6 h-6" />
            </div>
            <span className={cn(
              'text-[10px] font-medium -mt-1',
              activeTab === navItemCenter.id && 'font-semibold text-primary'
            )}>
              {navItemCenter.label}
            </span>
          </Link>

          {/* Itens da direita */}
          {navItemsRight.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
                <span className={cn(
                  'text-[10px] font-medium truncate max-w-[60px]',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botão de configurações */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Config</span>
          </button>
        </div>
      </nav>

      {/* Sheet de Configurações */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-4">
            {/* User Info */}
            {userEmail && (
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Conectado</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            {onSignOut && (
              <Button
                variant="outline"
                onClick={() => {
                  onSignOut();
                  setSettingsOpen(false);
                }}
                className="w-full gap-2 text-expense border-expense/30 hover:bg-expense/10 hover:text-expense"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
import { useState } from 'react';
import { LayoutDashboard, Receipt, CreditCard, TrendingUp, Settings, Moon, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const navItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Investimentos', icon: TrendingUp },
  { id: 'dividas' as Tab, label: 'Dívidas', icon: CreditCard },
];

export const MobileNav = ({ activeTab, onTabChange, theme, onToggleTheme }: MobileNavProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
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

          {/* Botão de configurações */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
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
            {/* Tema */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium text-foreground">Tema</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={onToggleTheme}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Versão */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">FluxoCerto</p>
                  <p className="text-xs text-muted-foreground">Controle Financeiro Pessoal</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">v1.0.0</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
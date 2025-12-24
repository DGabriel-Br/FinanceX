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
import { Button } from '@/components/ui/button';

type Tab = 'dashboard' | 'lancamentos' | 'dividas' | 'investimentos';

export interface MobileNavProps {
  activeTab: Tab;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const navItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos' as Tab, label: 'Lançamentos', icon: Receipt },
  { id: 'investimentos' as Tab, label: 'Investimentos', icon: TrendingUp },
  { id: 'dividas' as Tab, label: 'Dívidas', icon: CreditCard },
];

export const MobileNav = ({ activeTab, theme, onToggleTheme, userEmail, onSignOut }: MobileNavProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setSettingsOpen(false);
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    onSignOut?.();
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
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
                  <p className="font-medium text-foreground">FinanceX</p>
                  <p className="text-xs text-muted-foreground">Controle Financeiro Pessoal</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">v1.0.0</span>
              </div>
            </div>

            {/* Logout Button */}
            {onSignOut && (
              <Button
                variant="outline"
                onClick={handleLogoutClick}
                className="w-full gap-2 text-expense border-expense/30 hover:bg-expense/10 hover:text-expense"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você realmente deseja sair da sua conta? Será necessário fazer login novamente para acessar seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-expense hover:bg-expense/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
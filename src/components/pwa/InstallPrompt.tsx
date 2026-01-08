import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { cn } from '@/lib/utils';

export const InstallPrompt = () => {
  const { canShowPrompt, install, dismiss } = usePWAInstall();
  const isMobileExperience = useIsNativeApp();

  // Só mostra em dispositivos mobile e quando pode instalar
  if (!isMobileExperience || !canShowPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <div className={cn(
        "bg-card border border-border rounded-xl shadow-lg p-4",
        "flex items-center gap-3"
      )}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Instale o FinanceX
          </p>
          <p className="text-xs text-muted-foreground">
            Acesse mais rápido direto da tela inicial
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={dismiss}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            className="gap-1.5"
            onClick={install}
          >
            <Download className="w-4 h-4" />
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
};

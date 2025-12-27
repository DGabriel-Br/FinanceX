import { useState, useEffect } from 'react';
import { WifiOff, Database, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

export const OfflineModal = () => {
  const { isOnline } = useOnlineStatus();
  const [showModal, setShowModal] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    logger.info('[OfflineModal] State:', { isOnline, hasShownOnce, showModal });
    
    // Mostra o modal apenas na primeira vez que detectar offline
    if (!isOnline && !hasShownOnce) {
      logger.info('[OfflineModal] Showing modal - user went offline');
      setShowModal(true);
      setHasShownOnce(true);
    }
    
    // Fecha automaticamente quando voltar online
    if (isOnline && showModal) {
      logger.info('[OfflineModal] Hiding modal - user is back online');
      setShowModal(false);
    }
  }, [isOnline, hasShownOnce, showModal]);

  // Reset quando reconectar para mostrar novamente se ficar offline de novo
  useEffect(() => {
    if (isOnline) {
      setHasShownOnce(false);
    }
  }, [isOnline]);

  if (!showModal) {
    logger.info('[OfflineModal] Not rendering - showModal is false');
    return null;
  }

  logger.info('[OfflineModal] Rendering modal');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={() => setShowModal(false)}
      />
      
      {/* Card */}
      <div className={cn(
        "relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-300"
      )}>
        <div className="p-6 flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-yellow-500" />
          </div>
          
          {/* Título */}
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Você está sem internet
          </h2>
          
          {/* Mensagem */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            As informações serão salvas localmente e sincronizadas assim que a conexão for restabelecida.
          </p>
          
          {/* Info adicional */}
          <div className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-6">
            <Database className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground text-left">
              Seus dados estão seguros e disponíveis para uso offline.
            </p>
          </div>
          
          {/* Botão */}
          <Button 
            onClick={() => setShowModal(false)}
            className="w-full"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};

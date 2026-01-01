import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Gate component that blocks access to content for users without an active subscription.
 * Shows a paywall UI when subscription is not active.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const navigate = useNavigate();
  const { loading, hasActiveSubscription } = useSubscription();

  // Still loading subscription status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User has active subscription - render children
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // No active subscription - show paywall
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <FinanceLogo />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
          {/* Lock icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>

          {/* Title and description */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Assinatura necessária
            </h1>
            <p className="text-sm text-muted-foreground">
              Para acessar o FinanceX, você precisa de uma assinatura ativa.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/#pricing')} 
              className="w-full"
            >
              Ver planos e assinar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Voltar ao início
            </Button>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-muted-foreground">
            Já assinou? O processamento pode levar alguns segundos.{' '}
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary hover:underline"
            >
              Atualizar página
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

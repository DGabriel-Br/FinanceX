import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { Check, ArrowRight, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmail, setIsFetchingEmail] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  const isSuccess = searchParams.get('checkout') === 'success';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Redireciona se não veio do checkout
    if (!isSuccess || !sessionId) {
      navigate('/');
      return;
    }

    // Buscar email do checkout session
    const fetchCheckoutSession = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-checkout-session', {
          body: { session_id: sessionId }
        });

        if (error) {
          console.error('Error fetching session:', error);
          toast.error('Erro ao carregar dados do checkout');
          navigate('/');
          return;
        }

        if (data?.email) {
          setEmail(data.email);
        } else {
          toast.error('Email não encontrado no checkout');
          navigate('/');
          return;
        }
      } catch (err) {
        console.error('Error:', err);
        navigate('/');
        return;
      } finally {
        setIsFetchingEmail(false);
      }
    };

    fetchCheckoutSession();
    setMounted(true);
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [isSuccess, sessionId, navigate]);

  // Não renderiza nada enquanto verifica
  if (!isSuccess || !sessionId) {
    return null;
  }

  const handleSendPasswordLink = async () => {
    if (!email) return;
    
    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      console.error('Password reset error:', error);
    }

    // Sempre mostrar sucesso por segurança
    setEmailSent(true);
    toast.success('Link enviado! Verifique seu email.');
  };

  const handleAccessLogin = () => {
    navigate('/login');
  };

  if (isFetchingEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl transition-all duration-1000",
          mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
        )} />
        <div className={cn(
          "absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-income/20 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-200",
          mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
        )} />
        <div className={cn(
          "absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/15 to-income/20 rounded-full blur-3xl transition-all duration-1000 delay-300",
          mounted ? "opacity-40 scale-100" : "opacity-0 scale-50"
        )} />
        <div className={cn(
          "absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-income/15 to-primary/20 rounded-full blur-2xl transition-all duration-1000 delay-500",
          mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
        )} />
      </div>

      {/* Content */}
      <div className={cn(
        "relative z-10 max-w-md mx-auto px-6 text-center transition-all duration-700",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-end">
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-income/25 to-primary/20 rounded-2xl blur-xl" />
            <FinanceLogo size={48} className="relative drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
            <span 
              className="text-3xl font-black tracking-wider text-white -ml-1 relative"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </div>
        </div>

        {/* Success icon */}
        <div className={cn(
          "mx-auto w-20 h-20 rounded-full bg-income/20 flex items-center justify-center mb-6 transition-all duration-500 delay-200",
          showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}>
          <Check className="w-10 h-10 text-income" />
        </div>

        {/* Title */}
        <h1 className={cn(
          "text-3xl sm:text-4xl font-bold text-white mb-4 transition-all duration-500 delay-300",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Pronto. Sua conta está criada.
        </h1>

        {/* Description */}
        <p className={cn(
          "text-white/60 text-base sm:text-lg mb-8 transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Seu período de teste de 3 dias já começou.
          <br />
          {emailSent ? 'Verifique seu email para definir sua senha.' : 'Defina sua senha para acessar.'}
        </p>

        {!emailSent ? (
          <div className={cn(
            "space-y-4 transition-all duration-500 delay-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* Email display (read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wide text-left block">
                E-mail usado no checkout
              </label>
              <div className="h-12 px-4 text-base bg-sidebar-accent/50 border border-white/10 rounded-lg text-white/80 flex items-center">
                {email}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={handleSendPasswordLink}
              disabled={isLoading || !email}
              className="w-full h-14 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Receber link de acesso
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className={cn(
            "space-y-4 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* Email sent confirmation */}
            <div className="bg-income/10 border border-income/20 rounded-xl p-4">
              <p className="text-income text-sm">
                Enviamos um link para <strong>{email}</strong>
              </p>
              <p className="text-white/50 text-xs mt-2">
                Clique no link do email para definir sua senha e acessar o FinanceX.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleAccessLogin}
              className="w-full h-14 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300"
            >
              Ir para login
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Additional info */}
        <p className={cn(
          "text-white/40 text-xs mt-6 transition-all duration-500 delay-600",
          showContent ? "opacity-100" : "opacity-0"
        )}>
          Não chegou? Verifique o spam ou aguarde até 1 minuto.
        </p>
      </div>
    </div>
  );
}
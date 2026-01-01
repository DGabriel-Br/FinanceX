import { useState, useEffect, FormEvent } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'card' | 'success'>('email');
  const [cardComplete, setCardComplete] = useState(false);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { email },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setStep('card');
    } catch (err) {
      console.error('Error creating setup intent:', err);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret || !customerId) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsLoading(true);
    try {
      // Confirm the SetupIntent
      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (!setupIntent?.payment_method) {
        throw new Error('Falha ao processar cartão');
      }

      // Create subscription with the payment method
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          customerId,
          paymentMethodId: setupIntent.payment_method,
        },
      });

      if (error) throw error;

      setStep('success');
      toast.success('Assinatura criada com sucesso!');
      
      // Wait a bit then redirect
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      toast.error(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.4)',
        },
        iconColor: 'rgba(34, 211, 238, 0.8)',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-landing-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-landing-green" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Assinatura Confirmada!</h3>
        <p className="text-white/60 text-sm">
          Seu teste grátis de 3 dias começou. Redirecionando...
        </p>
      </div>
    );
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-white/80 text-sm mb-2 block">
            Seu email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-12 text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-white/50 hover:text-white/70 text-sm transition-colors"
        >
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm">
          Pagamento para: <span className="text-white">{email}</span>
        </p>
      </div>

      <div>
        <Label className="text-white/80 text-sm mb-2 block">
          Dados do cartão
        </Label>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <CardElement 
            options={cardElementOptions}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
        <Lock className="w-3 h-3" />
        <span>Pagamento seguro processado pelo Stripe</span>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !stripe || !cardComplete}
        className="w-full h-14 text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            Começar teste grátis de 3 dias
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>

      <p className="text-center text-white/40 text-xs leading-relaxed">
        Ao clicar, você concorda com a cobrança automática de R$14,90/mês após 3 dias.
        <br />
        Cancele quando quiser, em 1 clique.
      </p>

      <button
        type="button"
        onClick={() => setStep('email')}
        className="w-full text-white/50 hover:text-white/70 text-sm transition-colors"
      >
        ← Voltar
      </button>
    </form>
  );
}

export function StripePaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#22d3ee',
        colorBackground: 'transparent',
        colorText: '#fff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

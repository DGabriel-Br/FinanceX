import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Check } from "lucide-react";

const stripePromise = loadStripe("pk_live_51S5UaH1qJqkZgiRafrVP2e2P5xaD0rmT4wuKoZmkA84vVBJnFfHRQ87f1IYqeUJT79lQ7QxLvJNXkBdVJJ3fQmLV009hHqAVDv");

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function CheckoutForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?checkout=success`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          toast.error(error.message || "Erro no pagamento");
        } else {
          toast.error("Ocorreu um erro inesperado");
        }
      } else {
        toast.success("Assinatura iniciada com sucesso!");
        onSuccess?.();
        onClose();
        window.location.href = "/dashboard?checkout=success";
      }
    } catch (err) {
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Teste grátis de 3 dias</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Você não será cobrado agora. Após o período de teste, a assinatura será de R$14,90/mês.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Dados do cartão
          </label>
          <div className="border border-border rounded-lg p-4 bg-background">
            <PaymentElement
              onReady={() => setIsReady(true)}
              options={{
                layout: "tabs",
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading || !isReady}
          className="w-full h-12 text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            "Iniciar teste grátis"
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Ao continuar, você concorda com a cobrança automática de R$14,90/mês após 3 dias. 
          Cancele quando quiser, em 1 clique.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          Pagamento seguro
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          Criptografia SSL
        </div>
      </div>
    </form>
  );
}

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createSubscription();
    }
  }, [isOpen]);

  const createSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setError("Você precisa estar logado para assinar");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-subscription",
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }
      );

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error creating subscription:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar assinatura");
      toast.error("Erro ao iniciar checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClientSecret(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Assine o FinanceX Pro</DialogTitle>
          <DialogDescription>
            Controle total das suas finanças por apenas R$14,90/mês
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Preparando checkout...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={createSubscription} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {clientSecret && !isLoading && !error && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#16a34a",
                    colorBackground: "#ffffff",
                    colorText: "#1f2937",
                    colorDanger: "#ef4444",
                    fontFamily: "system-ui, sans-serif",
                    borderRadius: "8px",
                  },
                },
                locale: "pt-BR",
              }}
            >
              <CheckoutForm onSuccess={onSuccess} onClose={handleClose} />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

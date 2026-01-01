import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, RefreshCw, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { track } from "@/infra/analytics";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { toast } from "sonner";
import { FinanceLogo } from "@/components/ui/FinanceLogo";

const passwordSchema = z.object({
  password: z.string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

type TokenStatus = "loading" | "found" | "pending" | "expired" | "not_found" | "existing_user" | "error";

export default function SetupPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const directToken = searchParams.get("token");

  const [status, setStatus] = useState<TokenStatus>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const fetchToken = useCallback(async () => {
    if (!sessionId && !directToken) {
      setStatus("error");
      setErrorMessage("Sessão inválida. Por favor, tente fazer o checkout novamente.");
      return;
    }

    try {
      const body = directToken 
        ? { token: directToken }
        : { session_id: sessionId };

      const { data, error: fnError } = await supabase.functions.invoke("get-setup-token", {
        body,
      });

      if (fnError) {
        throw new Error(fnError.message || "Erro ao buscar token");
      }

      // Handle different statuses from the backend
      switch (data?.status) {
        case "found":
          setEmail(data.email);
          setToken(data.token);
          setStatus("found");
          // Track checkout completed when user arrives with valid token
          track('checkout_completed');
          break;
        
        case "existing_user":
          setStatus("existing_user");
          toast.info(data.message || "Você já possui uma conta.");
          setTimeout(() => navigate("/login"), 2000);
          break;
        
        case "pending":
          setStatus("pending");
          setEmail(data.email);
          setPollCount(prev => prev + 1);
          break;
        
        case "expired":
          setStatus("expired");
          setEmail(data.email);
          setResendEmail(data.email || "");
          setErrorMessage("Este link expirou. Solicite um novo link abaixo.");
          break;
        
        case "used":
          setStatus("error");
          setErrorMessage("Este link já foi utilizado. Faça login para continuar.");
          break;
        
        case "not_found":
          setStatus("not_found");
          setErrorMessage(data.error || "Token não encontrado.");
          break;
        
        default:
          if (data?.error) {
            throw new Error(data.error);
          }
          // Legacy compatibility - if no status but has token/email
          if (data?.token && data?.email) {
            setEmail(data.email);
            setToken(data.token);
            setStatus("found");
          } else {
            throw new Error("Resposta inesperada do servidor");
          }
      }
    } catch (err) {
      console.error("Error fetching token:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro ao carregar página");
    }
  }, [sessionId, directToken, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Polling for pending status (frontend fallback)
  useEffect(() => {
    if (status !== "pending" || pollCount >= 6) return;

    const timeout = setTimeout(() => {
      fetchToken();
    }, 3000); // Poll every 3 seconds

    return () => clearTimeout(timeout);
  }, [status, pollCount, fetchToken]);

  // Stop polling after max attempts
  useEffect(() => {
    if (status === "pending" && pollCount >= 6) {
      setStatus("not_found");
      setErrorMessage("O processamento está demorando mais que o esperado. Tente novamente em alguns minutos ou solicite um novo link.");
    }
  }, [status, pollCount]);

  const handleResendToken = async () => {
    if (!resendEmail) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }

    // Rate limiting: 1 resend per minute
    if (lastResendTime && Date.now() - lastResendTime < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - lastResendTime)) / 1000);
      toast.error(`Aguarde ${remaining} segundos para enviar novamente.`);
      return;
    }

    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("resend-setup-token", {
        body: { email: resendEmail },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Erro ao reenviar link");
      }

      setLastResendTime(Date.now());
      toast.success("Link enviado! Verifique seu e-mail.");
    } catch (err) {
      console.error("Error resending token:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao reenviar link");
    } finally {
      setIsResending(false);
    }
  };

  async function onSubmit(values: PasswordFormValues) {
    if (!token || !email) return;

    setIsSubmitting(true);
    try {
      // Setup password
      const { data, error: setupError } = await supabase.functions.invoke("setup-initial-password", {
        body: { token, password: values.password },
      });

      if (setupError || data?.error) {
        throw new Error(data?.error || setupError?.message || "Erro ao definir senha");
      }

      // Auto login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: values.password,
      });

      if (signInError) {
        throw new Error("Senha definida, mas ocorreu um erro ao fazer login. Tente fazer login manualmente.");
      }

      // Track password setup completed
      track('password_setup_completed');
      
      toast.success("Senha definida com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error setting up password:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao definir senha");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pending state - webhook still processing
  if (status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <FinanceLogo className="mb-8" />
        <div className="max-w-md w-full text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Finalizando sua conta...</h1>
          <p className="text-muted-foreground">
            Estamos processando seu pagamento. Isso pode levar alguns segundos.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Tentativa {pollCount + 1} de 6</span>
          </div>
        </div>
      </div>
    );
  }

  // Existing user - redirect to login
  if (status === "existing_user") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <FinanceLogo className="mb-8" />
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Você já tem uma conta!</h1>
          <p className="text-muted-foreground">Redirecionando para o login...</p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  // Expired or not found - show resend form
  if (status === "expired" || status === "not_found") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <FinanceLogo className="mb-8" />
        <div className="max-w-md w-full space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">
                {status === "expired" ? "Link expirado" : "Link não encontrado"}
              </h1>
              <p className="text-muted-foreground">
                {errorMessage || "Solicite um novo link de acesso abaixo."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Seu e-mail</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button 
                onClick={handleResendToken} 
                className="w-full" 
                disabled={isResending || !resendEmail}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar novo link"
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")} 
                className="w-full"
              >
                Já tenho senha, ir para login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <FinanceLogo className="mb-8" />
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Erro</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao início
            </Button>
            <Button onClick={() => navigate("/login")}>
              Fazer login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show password form
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
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Pronto. Sua conta já está criada.
            </h1>
            <p className="text-sm text-muted-foreground">
              Agora é só definir sua senha para acessar o FinanceX.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email field - locked */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email || ""}
                    disabled
                    className="pr-10 bg-muted/50 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password strength meter */}
              {password && <PasswordStrengthMeter password={password} />}

              {/* Confirm password field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Definindo senha...
                  </>
                ) : (
                  "Definir senha e entrar"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

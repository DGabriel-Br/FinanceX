import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

export default function SetupPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    async function fetchToken() {
      if (!sessionId) {
        setError("Sessão inválida. Por favor, tente fazer o checkout novamente.");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-setup-token", {
          body: { session_id: sessionId },
        });

        if (fnError || data?.error) {
          throw new Error(data?.error || fnError?.message || "Erro ao buscar token");
        }

        setEmail(data.email);
        setToken(data.token);
      } catch (err) {
        console.error("Error fetching token:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar página");
      } finally {
        setIsLoading(false);
      }
    }

    fetchToken();
  }, [sessionId]);

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

      toast.success("Senha definida com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error setting up password:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao definir senha");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <FinanceLogo className="mb-8" />
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

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

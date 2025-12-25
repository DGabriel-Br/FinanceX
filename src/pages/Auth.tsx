import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número');

export default function Auth() {
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/cadastro';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, signIn, signUp } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (isRegisterRoute && name.trim().length < 2) {
      toast.error('Por favor, insira seu nome');
      return false;
    }

    try {
      emailSchema.parse(email);
    } catch {
      toast.error('Por favor, insira um email válido');
      return false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    if (isRegisterRoute) {
      const { error } = await signUp(email, password, name.trim());
      setIsLoading(false);

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error('Erro ao criar conta: ' + error.message);
        }
      } else {
        toast.success('Conta criada com sucesso!');
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);
      setIsLoading(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="FinanceX" className="w-16 h-16 rounded-2xl animate-pulse object-cover" />
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large floating circles */}
          <div 
            className={cn(
              "absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl transition-all duration-1000",
              mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
            )} 
          />
          <div 
            className={cn(
              "absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-income/20 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-200",
              mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
            )} 
          />
          <div 
            className={cn(
              "absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/15 to-income/20 rounded-full blur-3xl transition-all duration-1000 delay-300",
              mounted ? "opacity-40 scale-100" : "opacity-0 scale-50"
            )} 
          />
          <div 
            className={cn(
              "absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-income/15 to-primary/20 rounded-full blur-2xl transition-all duration-1000 delay-500",
              mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
            )} 
          />
          
          {/* Decorative top element */}
          <div 
            className={cn(
              "absolute top-[8%] left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-primary/30 to-income/20 rounded-full blur-xl transition-all duration-1000 delay-400",
              mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
            )} 
          />
          
          {/* Star-like dots scattered */}
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-300" />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/35 rounded-full animate-pulse delay-500" />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-700" />
          <div className="absolute top-[40%] left-[30%] w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-200" />
          <div className="absolute top-[50%] left-[90%] w-1 h-1 bg-white/30 rounded-full animate-pulse delay-400" />
          <div className="absolute top-[80%] left-[40%] w-0.5 h-0.5 bg-white/35 rounded-full animate-pulse delay-600" />
          <div className="absolute top-[25%] left-[55%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-100" />
          <div className="absolute top-[85%] left-[75%] w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-800" />
          <div className="absolute top-[45%] left-[5%] w-1 h-1 bg-white/30 rounded-full animate-pulse delay-350" />
        </div>

        {/* Logo in top left */}
        <div 
          className={cn(
            "absolute top-6 left-6 flex items-center gap-3 z-20 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <img src={logo} alt="FinanceX" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          <span className="text-white font-bold text-lg">FinanceX</span>
        </div>

        {/* Centered Card */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div 
            className={cn(
              "w-full max-w-md bg-sidebar/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/5 transition-all duration-700 delay-200",
              mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
            )}
          >
            {/* Card Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {isRegisterRoute ? 'Crie sua conta' : 'Bem-vindo(a) de volta!'}
              </h1>
              <p className="text-white/60 text-sm">
                {isRegisterRoute 
                  ? 'Preencha os dados para começar a usar o FinanceX.'
                  : 'Entre com seu e-mail e senha para começar.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field - only for register */}
              {isRegisterRoute && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    Nome completo {!name.trim() && <span className="text-red-400">*</span>}
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 px-3 text-sm bg-sidebar-accent/80 border-0 rounded-md text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                  E-mail {!email.trim() && <span className="text-red-400">*</span>}
                </label>
                <Input
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 px-3 text-sm bg-sidebar-accent/80 border-0 rounded-md text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary/50"
                />
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                  Senha {!password && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 px-3 pr-12 text-sm bg-sidebar-accent/80 border-0 rounded-md text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isRegisterRoute && (
                  <PasswordStrengthMeter password={password} className="mt-3" />
                )}
              </div>

              {/* Forgot password - only for login */}
              {!isRegisterRoute && (
                <div>
                  <span className="text-white/50 text-xs">Esqueceu a senha? </span>
                  <button
                    type="button"
                    onClick={() => toast.info('Função de recuperação de senha será implementada em breve.')}
                    className="text-primary hover:underline text-xs font-medium transition-colors"
                  >
                    Clique aqui
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isRegisterRoute ? 'Criar conta' : 'Entrar'
                )}
              </Button>

              {/* Bottom link */}
              <p className="text-white/50 text-xs text-center pt-2">
                {isRegisterRoute ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                <button
                  type="button"
                  onClick={() => navigate(isRegisterRoute ? '/login' : '/cadastro')}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {isRegisterRoute ? 'Entrar' : 'Cadastre-se agora.'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Version - This will never be shown due to MobileGuard, but kept for safety */}
      <div className="md:hidden min-h-screen flex flex-col bg-sidebar">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/50">Acesse pelo aplicativo</p>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'A senha deve ter pelo menos 6 caracteres');

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

    try {
      passwordSchema.parse(password);
    } catch {
      toast.error('A senha deve ter pelo menos 6 caracteres');
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
    <div className="min-h-screen flex flex-col bg-sidebar">
      {/* Header with back button */}
      <header 
        className={cn(
          "px-4 pt-4 safe-area-top transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <button
          onClick={() => navigate('/welcome')}
          className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
        {/* Title */}
        <h1 
          className={cn(
            "text-2xl md:text-3xl font-bold text-white mb-8 transition-all duration-500 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {isRegisterRoute ? 'Crie sua conta' : 'Boas-vindas de volta!'}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          {/* Name field - only for register */}
          {isRegisterRoute && (
            <div 
              className={cn(
                "space-y-2 transition-all duration-500 delay-150",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <label className="text-sm text-white/70">Nome completo</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-4 text-base bg-sidebar-accent border-0 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {/* Email field */}
          <div 
            className={cn(
              "space-y-2 transition-all duration-500",
              isRegisterRoute ? "delay-200" : "delay-150",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <label className="text-sm text-white/70">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-14 px-4 text-base bg-sidebar-accent border-0 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Password field */}
          <div 
            className={cn(
              "space-y-2 transition-all duration-500",
              isRegisterRoute ? "delay-[250ms]" : "delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <label className="text-sm text-white/70">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-4 pr-14 text-base bg-sidebar-accent border-0 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {isRegisterRoute && (
              <p className="text-xs text-white/50">Mínimo de 6 caracteres</p>
            )}
          </div>

          {/* Submit Button */}
          <div 
            className={cn(
              "pt-4 transition-all duration-500",
              isRegisterRoute ? "delay-300" : "delay-[250ms]",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isRegisterRoute ? 'Criar conta' : 'Entrar'
              )}
            </Button>
          </div>

          {/* Forgot password - only for login */}
          {!isRegisterRoute && (
            <div 
              className={cn(
                "text-center transition-all duration-500 delay-300",
                mounted ? "opacity-100" : "opacity-0"
              )}
            >
              <button
                type="button"
                onClick={() => toast.info('Função de recuperação de senha será implementada em breve.')}
                className="text-primary hover:underline text-sm font-medium transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}
        </form>

        {/* Bottom link */}
        <div 
          className={cn(
            "mt-6 text-center transition-all duration-500",
            isRegisterRoute ? "delay-[350ms]" : "delay-[350ms]",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <p className="text-white/60 text-sm">
            {isRegisterRoute ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
            <button
              type="button"
              onClick={() => navigate(isRegisterRoute ? '/login' : '/cadastro')}
              className="text-primary hover:underline font-medium transition-colors"
            >
              {isRegisterRoute ? 'Entrar' : 'Registre-se'}
            </button>
          </p>
        </div>
      </div>

      {/* Safe area bottom spacing */}
      <div className="safe-area-bottom" />
    </div>
  );
}

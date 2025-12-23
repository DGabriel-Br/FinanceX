import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Shield, Smartphone, BarChart3 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'A senha deve ter pelo menos 6 caracteres');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
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
    
    if (isRegister) {
      const { error } = await signUp(email, password);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-income to-primary flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">FC</span>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar to-primary/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-income rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-income to-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-lg">FC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">FluxoCerto</h1>
              <p className="text-white/60 text-sm">Controle Financeiro</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Suas finanças,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-income to-primary">
              sob controle.
            </span>
          </h2>
          
          <p className="text-white/70 text-lg mb-12 max-w-md">
            Acompanhe receitas, despesas, investimentos e dívidas em um só lugar. 
            Simples, rápido e seguro.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-income" />
              </div>
              <span className="text-white/80">Dashboard completo com gráficos</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white/80">Acesse de qualquer dispositivo</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-income" />
              </div>
              <span className="text-white/80">Seus dados sempre protegidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-income to-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">FC</span>
            </div>
            <span className="text-2xl font-bold text-foreground">FluxoCerto</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isRegister ? 'Crie sua conta' : 'Bem-vindo de volta!'}
            </h2>
            <p className="text-muted-foreground">
              {isRegister 
                ? 'Preencha os dados abaixo para começar.' 
                : 'Entre com seu e-mail e senha para começar.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-5 text-base bg-background border-2 border-border rounded-xl focus:border-primary transition-colors"
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-5 pr-14 text-base bg-background border-2 border-border rounded-xl focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {isRegister && (
              <p className="text-xs text-muted-foreground -mt-2">
                Mínimo de 6 caracteres
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#00a3ff] hover:opacity-90 transition-opacity shadow-lg shadow-primary/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isRegister ? 'Criar conta' : 'Entrar'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 space-y-3 text-sm">
            <p className="text-muted-foreground">
              {isRegister ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary hover:underline font-medium"
              >
                {isRegister ? 'Entrar' : 'Cadastrar agora'}
              </button>
            </p>
            {!isRegister && (
              <p className="text-muted-foreground">
                Esqueceu a senha?{' '}
                <button
                  type="button"
                  onClick={() => toast.info('Função de recuperação de senha será implementada em breve.')}
                  className="text-primary hover:underline font-medium"
                >
                  Clique aqui
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

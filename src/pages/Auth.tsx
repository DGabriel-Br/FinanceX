import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Shield, Smartphone, BarChart3 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="FinanceX" className="w-16 h-16 rounded-2xl animate-pulse object-cover" />
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar to-primary/20 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div 
            className={cn(
              "absolute top-20 left-20 w-72 h-72 bg-income/10 rounded-full blur-3xl transition-all duration-1000",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )} 
          />
          <div 
            className={cn(
              "absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl transition-all duration-1000 delay-300",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )} 
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          {/* Logo */}
          <div 
            className={cn(
              "flex items-center gap-4 mb-12 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <img src={logo} alt="FinanceX" className="w-14 h-14 rounded-xl shadow-lg shadow-primary/30 object-cover" />
            <div>
              <h1 className="text-2xl font-bold">FinanceX</h1>
              <p className="text-white/60 text-sm">Suas finanças, sob controle.</p>
            </div>
          </div>

          {/* Headline */}
          <h2 
            className={cn(
              "text-4xl xl:text-5xl font-bold leading-tight mb-6 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Suas finanças,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-income to-primary">
              sob controle.
            </span>
          </h2>
          
          <p 
            className={cn(
              "text-white/70 text-lg mb-12 max-w-md transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Acompanhe receitas, despesas, investimentos e dívidas em um só lugar. 
            Simples, rápido e seguro.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: BarChart3, text: "Dashboard completo com gráficos", delay: "delay-300" },
              { icon: Smartphone, text: "Acesse de qualquer dispositivo", delay: "delay-[400ms]" },
              { icon: Shield, text: "Seus dados sempre protegidos", delay: "delay-500" },
            ].map((feature, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-4 transition-all duration-700",
                  feature.delay,
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <feature.icon className={cn("w-5 h-5", index % 2 === 0 ? "text-income" : "text-primary")} />
                </div>
                <span className="text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form - Always light background */}
      <div 
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ backgroundColor: '#f5f7fa', transition: 'none' }}
      >
        <div className="w-full max-w-sm">
          
          {/* Logo - apenas mobile */}
          <div 
            className={cn(
              "flex lg:hidden items-center justify-center gap-3 mb-8 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <img src={logo} alt="FinanceX" className="w-12 h-12 rounded-xl shadow-lg shadow-primary/30 object-cover" />
            <div>
            <h1 className="text-xl font-bold text-[hsl(220,20%,10%)]">FinanceX</h1>
              <p className="text-[hsl(220,10%,45%)] text-xs">Suas finanças, sob controle.</p>
            </div>
          </div>

          {/* Heading */}
          <div 
            className={cn(
              "mb-8 text-center lg:text-left transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-2xl font-bold text-[hsl(220,20%,10%)] mb-2">
              {isRegisterRoute ? 'Crie sua conta' : 'Bem-vindo de volta!'}
            </h2>
            <p className="text-[hsl(220,10%,45%)] whitespace-nowrap text-sm lg:text-base">
              {isRegisterRoute 
                ? 'Preencha os dados para começar.' 
                : 'Entre com seu e-mail e senha.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterRoute && (
              <div 
                className={cn(
                  "transition-all duration-500 delay-150",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-14 px-5 text-base bg-white border-2 border-[hsl(220,15%,90%)] rounded-xl focus:border-primary transition-all duration-300 hover:border-primary/50 text-[hsl(220,20%,10%)] placeholder:text-[hsl(220,10%,45%)]"
                />
              </div>
            )}
            <div 
              className={cn(
                "transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-5 text-base bg-white border-2 border-[hsl(220,15%,90%)] rounded-xl focus:border-primary transition-all duration-300 hover:border-primary/50 text-[hsl(220,20%,10%)] placeholder:text-[hsl(220,10%,45%)]"
              />
            </div>
            
            <div 
              className={cn(
                "relative transition-all duration-500 delay-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-5 pr-14 text-base bg-white border-2 border-[hsl(220,15%,90%)] rounded-xl focus:border-primary transition-all duration-300 hover:border-primary/50 text-[hsl(220,20%,10%)] placeholder:text-[hsl(220,10%,45%)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)] hover:text-[hsl(220,20%,10%)] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {isRegisterRoute && (
              <p 
                className={cn(
                  "text-xs text-[hsl(220,10%,45%)] -mt-2 transition-all duration-300",
                  mounted ? "opacity-100" : "opacity-0"
                )}
              >
                Mínimo de 6 caracteres
              </p>
            )}

            <div 
              className={cn(
                "transition-all duration-500 delay-[400ms]",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#00a3ff] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary/30" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isRegisterRoute ? 'Criar conta' : 'Entrar'
                )}
              </Button>
            </div>
          </form>

          {/* Links */}
          <div 
            className={cn(
              "mt-8 space-y-3 text-sm text-center lg:text-left transition-all duration-500 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-[hsl(220,10%,45%)]">
              {isRegisterRoute ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
              <button
                type="button"
                onClick={() => navigate(isRegisterRoute ? '/login' : '/cadastro')}
                className="text-primary hover:underline font-medium transition-colors"
              >
                {isRegisterRoute ? 'Entrar' : 'Cadastrar agora'}
              </button>
            </p>
            {!isRegisterRoute && (
              <p className="text-[hsl(220,10%,45%)]">
                Esqueceu a senha?{' '}
                <button
                  type="button"
                  onClick={() => toast.info('Função de recuperação de senha será implementada em breve.')}
                  className="text-primary hover:underline font-medium transition-colors"
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

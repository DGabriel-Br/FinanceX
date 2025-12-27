import { useState, useEffect, useMemo, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número');

interface FloatingParticleProps {
  delay: number;
  duration: number;
  size: number;
  startX: number;
  startY: number;
  color: string;
}

// Floating particle component - moved outside to avoid ref warnings
const FloatingParticle = forwardRef<HTMLDivElement, FloatingParticleProps>(
  ({ delay, duration, size, startX, startY, color }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute rounded-full pointer-events-none",
          color
        )}
        style={{
          width: size,
          height: size,
          left: `${startX}%`,
          top: `${startY}%`,
          animation: `float-particle ${duration}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  }
);

FloatingParticle.displayName = "FloatingParticle";

type Screen = 'welcome' | 'login' | 'register';

interface NativeAuthScreensProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  onSuccess: () => void;
}

export function NativeAuthScreens({ onSignIn, onSignUp, onSuccess }: NativeAuthScreensProps) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [slideAnimation, setSlideAnimation] = useState<'slide-in-right' | 'slide-in-left' | 'none'>('none');
  const [bgFading, setBgFading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved credentials
    const savedEmail = localStorage.getItem('financex_saved_email');
    const savedPassword = localStorage.getItem('financex_saved_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleNavigate = (newScreen: Screen) => {
    const goingBack = newScreen === 'welcome';
    // Trigger background fade
    setBgFading(true);
    setTimeout(() => setBgFading(false), 300);
    // Set the animation for the NEW screen
    // Going back to welcome = new screen slides in from LEFT
    // Going forward to login/register = new screen slides in from RIGHT
    setSlideAnimation(goingBack ? 'slide-in-left' : 'slide-in-right');
    setAnimationKey(prev => prev + 1);
    setScreen(newScreen);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateLogin = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast.error('Por favor, insira um email válido');
      triggerShake();
      return false;
    }

    if (password.length < 1) {
      toast.error('Por favor, insira sua senha');
      triggerShake();
      return false;
    }

    return true;
  };

  const validateRegister = () => {
    if (name.trim().length < 2) {
      toast.error('Por favor, insira seu nome');
      triggerShake();
      return false;
    }

    try {
      emailSchema.parse(email);
    } catch {
      toast.error('Por favor, insira um email válido');
      triggerShake();
      return false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      triggerShake();
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      triggerShake();
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    const { error } = await onSignIn(email, password);
    setIsLoading(false);

    if (error) {
      triggerShake();
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login: ' + error.message);
      }
    } else {
      if (rememberMe) {
        localStorage.setItem('financex_saved_email', email);
        localStorage.setItem('financex_saved_password', password);
      } else {
        localStorage.removeItem('financex_saved_email');
        localStorage.removeItem('financex_saved_password');
      }
      toast.success('Login realizado com sucesso!');
      onSuccess();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    const { error } = await onSignUp(email, password, name.trim());
    setIsLoading(false);

    if (error) {
      triggerShake();
      if (error.message.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Tente fazer login.');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } else {
      toast.success('Conta criada com sucesso!');
      onSuccess();
    }
  };

  // CSS Animations
  const cssAnimations = `
    @keyframes float-particle {
      0%, 100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      50% {
        transform: translateY(-120px) translateX(30px) scale(1.3);
        opacity: 0.8;
      }
      90% {
        opacity: 1;
      }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
      20%, 40%, 60%, 80% { transform: translateX(6px); }
    }
    @keyframes slide-in-right {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes slide-in-left {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }
    .animate-slide-in-left {
      animation: slide-in-left 0.3s ease-out forwards;
    }
  `;

  // Generate random particles - igual ao web
  const particles = useMemo(() => {
    const colors = [
      'bg-primary/40',
      'bg-income/30',
      'bg-white/20',
      'bg-primary/25',
      'bg-income/20',
      'bg-white/15',
    ];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 6,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden flex flex-col transition-opacity duration-300",
        bgFading && "opacity-80"
      )}>
          <style>{cssAnimations}</style>
        
        {/* Floating Particles - igual ao web */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Animated Background Elements - igual ao web */}
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
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute top-[40%] left-[30%] w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-[50%] left-[90%] w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[80%] left-[40%] w-0.5 h-0.5 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-[25%] left-[55%] w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-[85%] left-[75%] w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-[45%] left-[5%] w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.35s' }} />
        </div>

        {/* Content */}
        <div 
          key={`welcome-content-${animationKey}`}
          className={cn(
            "flex-1 flex flex-col items-center justify-center px-8 relative z-10",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right"
          )}
        >
          {/* Logo - igual ao da versão web */}
          <div className="mb-8">
            <div className="relative flex items-end justify-center">
              {/* Glow effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-income/40 to-primary/30 rounded-2xl blur-3xl animate-pulse" />
              <FinanceLogo size={48} className="relative drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
              <span 
                className="text-3xl font-black tracking-wider text-white -ml-1 relative"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-2xl font-bold text-white text-center mb-4 leading-tight"
          >
            BEM-VINDO(A) AO SEU{'\n'}CONTROLE FINANCEIRO!
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-center text-base mb-12 max-w-xs leading-relaxed">
            Gerencie suas finanças de forma simples e inteligente. Comece agora!
          </p>
        </div>

        {/* Bottom buttons */}
        <div 
          key={`welcome-buttons-${animationKey}`}
          className={cn(
            "px-6 pb-10 space-y-3 relative z-10",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right"
          )}
        >
          <Button
            onClick={() => handleNavigate('register')}
            variant="outline"
            className="w-full h-14 text-base font-semibold rounded-full border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
          >
            Registre-se
          </Button>
          <Button
            onClick={() => handleNavigate('login')}
            className="w-full h-14 text-base font-semibold rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          >
            Entrar
          </Button>
        </div>
        </div>
    );
  }

  // Login Screen
  if (screen === 'login') {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden flex flex-col transition-opacity duration-300",
        bgFading && "opacity-80"
      )}>
          <style>{cssAnimations}</style>

        {/* Floating Particles - igual ao web */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn("absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl transition-all duration-1000", mounted ? "opacity-60 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-income/20 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-200", mounted ? "opacity-50 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/15 to-income/20 rounded-full blur-3xl transition-all duration-1000 delay-300", mounted ? "opacity-40 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-income/15 to-primary/20 rounded-full blur-2xl transition-all duration-1000 delay-500", mounted ? "opacity-50 scale-100" : "opacity-0 scale-50")} />
          
          {/* Star-like dots */}
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>

        {/* Header */}
        <div className="pt-4 px-4 safe-area-top">
          <button
            onClick={() => handleNavigate('welcome')}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          key={`login-content-${animationKey}`}
          className={cn(
            "flex-1 px-6 pt-4 pb-8 safe-area-bottom",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right",
            isShaking && "animate-shake"
          )}
        >
          <h1 className="text-2xl font-bold text-white mb-8">
            Bem-vindo(a) de volta!
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-14 px-4 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-14 px-4 pr-12 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="remember" className="text-sm text-white/60 cursor-pointer">
                Lembrar credenciais
              </label>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold rounded-full bg-primary/90 hover:bg-primary text-primary-foreground mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
            </Button>

            {/* Forgot password */}
            <button
              type="button"
              onClick={() => toast.info('Função de recuperação de senha será implementada em breve.')}
              className="w-full text-center text-primary text-sm font-medium py-2"
            >
              Esqueceu a senha?
            </button>
          </form>
        </div>
        </div>
    );
  }

  // Register Screen
  if (screen === 'register') {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden flex flex-col transition-opacity duration-300",
        bgFading && "opacity-80"
      )}>
          <style>{cssAnimations}</style>

        {/* Floating Particles - igual ao web */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn("absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl transition-all duration-1000", mounted ? "opacity-60 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-income/20 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-200", mounted ? "opacity-50 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/15 to-income/20 rounded-full blur-3xl transition-all duration-1000 delay-300", mounted ? "opacity-40 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-income/15 to-primary/20 rounded-full blur-2xl transition-all duration-1000 delay-500", mounted ? "opacity-50 scale-100" : "opacity-0 scale-50")} />
          
          {/* Star-like dots */}
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>

        {/* Header */}
        <div className="pt-4 px-4 safe-area-top">
          <button
            onClick={() => handleNavigate('welcome')}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          key={`register-content-${animationKey}`}
          className={cn(
            "flex-1 px-6 pt-4 pb-8 safe-area-bottom overflow-auto",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right",
            isShaking && "animate-shake"
          )}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Crie sua conta
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Preencha os dados abaixo para começar
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Nome completo</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-14 px-4 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-14 px-4 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-14 px-4 pr-12 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrengthMeter password={password} className="mt-2" />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Confirmar senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    "h-14 px-4 pr-12 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50",
                    confirmPassword && password !== confirmPassword && "ring-2 ring-red-500/50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">As senhas não coincidem</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-400">Senhas coincidem ✓</p>
              )}
            </div>

            {/* Register button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold rounded-full bg-primary/90 hover:bg-primary text-primary-foreground mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar conta'}
            </Button>

            {/* Already have account */}
            <p className="text-center text-white/50 text-sm pt-2">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => handleNavigate('login')}
                className="text-primary font-medium"
              >
                Entrar
              </button>
            </p>
          </form>
        </div>
        </div>
    );
  }

  return null;
}

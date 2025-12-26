import { useState, useEffect, useMemo } from 'react';
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

type Screen = 'welcome' | 'login' | 'register';

interface NativeAuthScreensProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  onSuccess: () => void;
}

// Floating blob component for background
const FloatingBlob = ({ 
  className,
  delay = 0,
  size = 200,
  color = 'bg-purple-500/30'
}: { 
  className?: string;
  delay?: number;
  size?: number;
  color?: string;
}) => {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        color,
        className
      )}
      style={{
        width: size,
        height: size,
        animation: `float-blob 20s ease-in-out ${delay}s infinite`,
      }}
    />
  );
};

// Sparkle dot component
const Sparkle = ({ x, y, delay = 0, size = 2 }: { x: number; y: number; delay?: number; size?: number }) => (
  <div
    className="absolute rounded-full bg-white/60"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      animation: `sparkle 3s ease-in-out ${delay}s infinite`,
    }}
  />
);

export function NativeAuthScreens({ onSignIn, onSignUp, onSuccess }: NativeAuthScreensProps) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

  // Generate sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: 1 + Math.random() * 2,
    }));
  }, []);

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
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(newScreen);
      setIsTransitioning(false);
    }, 200);
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
    @keyframes float-blob {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      25% {
        transform: translate(30px, -30px) scale(1.1);
      }
      50% {
        transform: translate(-20px, 20px) scale(0.95);
      }
      75% {
        transform: translate(20px, 30px) scale(1.05);
      }
    }
    @keyframes sparkle {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.5);
      }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
      20%, 40%, 60%, 80% { transform: translateX(6px); }
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  `;

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-[#0f1629] relative overflow-hidden flex flex-col">
        <style>{cssAnimations}</style>
        
        {/* Floating blobs */}
        <FloatingBlob 
          className="top-[5%] left-[-10%]" 
          size={280} 
          color="bg-gradient-to-br from-pink-500/40 to-purple-600/30"
          delay={0}
        />
        <FloatingBlob 
          className="top-[15%] right-[-5%]" 
          size={200} 
          color="bg-gradient-to-br from-blue-400/30 to-cyan-500/20"
          delay={2}
        />
        <FloatingBlob 
          className="bottom-[25%] left-[5%]" 
          size={180} 
          color="bg-gradient-to-br from-violet-500/35 to-fuchsia-500/25"
          delay={4}
        />
        <FloatingBlob 
          className="bottom-[10%] right-[10%]" 
          size={150} 
          color="bg-gradient-to-br from-rose-400/30 to-orange-400/20"
          delay={6}
        />

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((s) => (
            <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f1629]/80 pointer-events-none" />

        {/* Content */}
        <div 
          className={cn(
            "flex-1 flex flex-col items-center justify-center px-8 relative z-10 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
          className={cn(
            "px-6 pb-10 space-y-3 relative z-10 transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
      <div className="min-h-screen bg-[#0f1219] relative overflow-hidden flex flex-col">
        <style>{cssAnimations}</style>

        {/* Subtle background blobs */}
        <FloatingBlob 
          className="top-[20%] left-[-15%]" 
          size={200} 
          color="bg-violet-600/15"
          delay={0}
        />
        <FloatingBlob 
          className="bottom-[30%] right-[-10%]" 
          size={180} 
          color="bg-blue-500/10"
          delay={3}
        />

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {sparkles.slice(0, 15).map((s) => (
            <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />
          ))}
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
          className={cn(
            "flex-1 px-6 pt-4 transition-all duration-300",
            isTransitioning ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0",
            isShaking && "animate-shake"
          )}
        >
          <h1 className="text-2xl font-bold text-white mb-8">
            Boas-vindas de volta!
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
                className="h-14 px-4 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
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
                  className="h-14 px-4 pr-12 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
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
      <div className="min-h-screen bg-[#0f1219] relative overflow-hidden flex flex-col">
        <style>{cssAnimations}</style>

        {/* Subtle background blobs */}
        <FloatingBlob 
          className="top-[10%] right-[-15%]" 
          size={200} 
          color="bg-cyan-500/15"
          delay={0}
        />
        <FloatingBlob 
          className="bottom-[20%] left-[-10%]" 
          size={180} 
          color="bg-violet-500/10"
          delay={3}
        />

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {sparkles.slice(0, 15).map((s) => (
            <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />
          ))}
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
          className={cn(
            "flex-1 px-6 pt-4 pb-8 overflow-auto transition-all duration-300",
            isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0",
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
                className="h-14 px-4 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
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
                className="h-14 px-4 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
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
                  className="h-14 px-4 pr-12 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
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
                    "h-14 px-4 pr-12 text-base bg-[#1a1d2e] border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50",
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

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
import { useNavigationBar } from '@/hooks/useNavigationBar';
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Deve conter pelo menos um caractere especial');

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

type Screen = 'welcome' | 'login' | 'register' | 'forgot-password';

interface NativeAuthScreensProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  onResetPassword: (email: string) => Promise<{ error: any }>;
  onSuccess: () => void;
}

export function NativeAuthScreens({ onSignIn, onSignUp, onResetPassword, onSuccess }: NativeAuthScreensProps) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mounted, setMounted] = useState(false);
  const [initialFadeIn, setInitialFadeIn] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [slideAnimation, setSlideAnimation] = useState<'slide-in-right' | 'slide-in-left' | 'none'>('none');
  const [bgFading, setBgFading] = useState(false);
  
  // Configura a cor da barra de navegação do Android (usa tema dark pois as telas de auth usam fundo escuro)
  useNavigationBar('dark');
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Single field for email or phone
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  const [registerStep, setRegisterStep] = useState<'method' | 'details'>('method');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Helper to detect if input is a phone number
  const isPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    // It's a phone if it starts with digits and has 10-11 digits (Brazilian format)
    return digitsOnly.length >= 10 && digitsOnly.length <= 11 && /^\d+$/.test(digitsOnly);
  };

  // Helper to detect if the raw input looks like a phone (for formatting)
  const looksLikePhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    // If it starts with a digit and has mostly digits, treat as phone
    return /^\d/.test(value.trim()) && digitsOnly.length >= 2;
  };

  useEffect(() => {
    // Trigger initial fade-in animation
    requestAnimationFrame(() => {
      setInitialFadeIn(true);
    });
    setMounted(true);
    // Load saved identifier (NEVER store passwords!)
    const savedIdentifier = localStorage.getItem('financex_saved_identifier');
    if (savedIdentifier) {
      setLoginIdentifier(savedIdentifier);
      setRememberMe(true);
    }
    // Security: Remove any legacy stored passwords and old keys
    localStorage.removeItem('financex_saved_password');
    localStorage.removeItem('financex_saved_email');
    localStorage.removeItem('financex_saved_phone');
  }, []);

  const handleNavigate = (newScreen: Screen) => {
    const goingBack = newScreen === 'welcome' || (screen === 'forgot-password' && newScreen === 'login');
    // Simplified fade without delay
    setBgFading(true);
    requestAnimationFrame(() => {
      setTimeout(() => setBgFading(false), 200);
    });
    setSlideAnimation(goingBack ? 'slide-in-left' : 'slide-in-right');
    setAnimationKey(prev => prev + 1);
    setScreen(newScreen);
    setEmailSent(false);
    // Reset register step when navigating to register
    if (newScreen === 'register') {
      setRegisterStep('method');
    }
  };

  const handleRegisterBack = () => {
    if (registerStep === 'details') {
      setSlideAnimation('slide-in-left');
      setAnimationKey(prev => prev + 1);
      setRegisterStep('method');
    } else {
      handleNavigate('welcome');
    }
  };

  const handleRegisterNext = () => {
    // Validate email or phone based on method
    if (registerMethod === 'email') {
      try {
        emailSchema.parse(email);
      } catch {
        toast.error('Por favor, insira um email válido');
        triggerShake();
        return;
      }
    } else {
      // Basic phone validation
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        toast.error('Por favor, insira um telefone válido');
        triggerShake();
        return;
      }
    }
    
    setSlideAnimation('slide-in-right');
    setAnimationKey(prev => prev + 1);
    setRegisterStep('details');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateLogin = () => {
    const trimmedIdentifier = loginIdentifier.trim();
    
    if (!trimmedIdentifier) {
      toast.error('Por favor, insira seu e-mail ou telefone');
      triggerShake();
      return false;
    }

    // Check if it's a phone number
    const digitsOnly = trimmedIdentifier.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 11;
    
    if (!isPhone) {
      // Validate as email
      try {
        emailSchema.parse(trimmedIdentifier);
      } catch {
        toast.error('Por favor, insira um e-mail ou telefone válido');
        triggerShake();
        return false;
      }
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

    // Email/phone already validated in first step, but double-check
    if (registerMethod === 'email') {
      try {
        emailSchema.parse(email);
      } catch {
        toast.error('Por favor, insira um email válido');
        triggerShake();
        return false;
      }
    } else {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        toast.error('Por favor, insira um telefone válido');
        triggerShake();
        return false;
      }
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
    
    // Detect if identifier is phone or email
    const trimmedIdentifier = loginIdentifier.trim();
    const digitsOnly = trimmedIdentifier.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 11;
    
    // For phone login, use the generated email format
    const loginEmail = isPhone 
      ? `${digitsOnly}@phone.financex.app` 
      : trimmedIdentifier;
    const result = await onSignIn(loginEmail, password);
    setIsLoading(false);

    if (result.error) {
      triggerShake();
      
      // Type assertion for the extended result
      const loginResult = result as { error: Error; blocked?: boolean; remainingSeconds?: number; attemptsRemaining?: number };
      
      // Show specific feedback based on login result
      if (loginResult.blocked) {
        toast.error(`Conta bloqueada. Aguarde ${loginResult.remainingSeconds}s.`, {
          duration: 5000,
        });
      } else if (loginResult.attemptsRemaining !== undefined && loginResult.attemptsRemaining <= 3) {
        if (result.error.message.includes('Invalid login credentials')) {
          toast.error(`Credenciais incorretas. ${loginResult.attemptsRemaining} tentativa(s) restante(s).`);
        } else {
          toast.error(result.error.message);
        }
      } else if (result.error.message.includes('Invalid login credentials')) {
        toast.error('E-mail/telefone ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login: ' + result.error.message);
      }
    } else {
      // Save identifier if remember me is checked (NEVER save passwords!)
      if (rememberMe) {
        localStorage.setItem('financex_saved_identifier', loginIdentifier);
      } else {
        localStorage.removeItem('financex_saved_identifier');
      }
      toast.success('Login realizado com sucesso!');
      onSuccess();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    // For phone registration, create a fake email using the phone number
    const registrationEmail = registerMethod === 'phone' 
      ? `${phone.replace(/\D/g, '')}@phone.financex.app` 
      : email;
    const { error } = await onSignUp(registrationEmail, password, name.trim());
    setIsLoading(false);

    if (error) {
      triggerShake();
      if (error.message.includes('User already registered')) {
        toast.error(registerMethod === 'phone' 
          ? 'Este telefone já está cadastrado. Tente fazer login.'
          : 'Este email já está cadastrado. Tente fazer login.');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } else {
      toast.success('Conta criada com sucesso!');
      onSuccess();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch {
      toast.error('Por favor, insira um email válido');
      triggerShake();
      return;
    }
    
    setIsLoading(true);
    const { error } = await onResetPassword(email);
    setIsLoading(false);
    
    if (error) {
      triggerShake();
      toast.error('Erro ao enviar email: ' + error.message);
    } else {
      setEmailSent(true);
      toast.success('Email de recuperação enviado!');
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
    @keyframes fade-scale-in {
      from {
        opacity: 0;
        transform: scale(0.97);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes initial-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.25s ease-out forwards;
    }
    .animate-slide-in-left {
      animation: slide-in-left 0.25s ease-out forwards;
    }
    .animate-fade-scale-in {
      animation: fade-scale-in 0.3s ease-out forwards;
    }
    .animate-initial-fade-in {
      animation: initial-fade-in 0.4s ease-out forwards;
    }
  `;

  // Generate random particles - mais sutis para fundo escuro
  const particles = useMemo(() => {
    const colors = [
      'bg-primary/20',
      'bg-white/10',
      'bg-white/8',
      'bg-primary/15',
      'bg-white/6',
      'bg-primary/12',
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 15,
      size: 1.5 + Math.random() * 4,
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
        {/* Wrapper para fade-in do conteúdo, mantendo background sempre visível */}
        <div className={cn(
          "absolute inset-0 flex flex-col",
          !initialFadeIn && "opacity-0",
          initialFadeIn && "animate-initial-fade-in"
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
      </div>
    );
  }

  // Login Screen
  if (screen === 'login') {
    return (
      <div className={cn(
        "min-h-screen bg-[radial-gradient(ellipse_at_top,hsl(225,12%,14%)_0%,hsl(225,8%,10%)_50%,hsl(225,6%,8%)_100%)] relative overflow-hidden flex flex-col transition-opacity duration-300",
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
          <div className={cn("absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl transition-all duration-1000", mounted ? "opacity-40 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-primary/10 to-white/5 rounded-full blur-2xl transition-all duration-1000 delay-200", mounted ? "opacity-30 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/8 to-white/5 rounded-full blur-3xl transition-all duration-1000 delay-300", mounted ? "opacity-25 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-white/5 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-500", mounted ? "opacity-30 scale-100" : "opacity-0 scale-50")} />
          
          {/* Star-like dots */}
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/18 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/12 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
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
          <h1 className="text-2xl font-bold text-white mb-6">
            Bem-vindo(a) de volta!
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Single field for Email or Phone */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">E-mail ou número de telefone</label>
              <Input
                type="text"
                value={loginIdentifier}
                onChange={(e) => {
                  const value = e.target.value;
                  // Auto-format if it looks like a phone number
                  if (looksLikePhone(value)) {
                    setLoginIdentifier(formatPhone(value));
                  } else {
                    setLoginIdentifier(value);
                  }
                }}
                maxLength={50}
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
              onClick={() => handleNavigate('forgot-password')}
              className="w-full text-center text-primary text-sm font-medium py-2"
            >
              Esqueceu a senha?
            </button>
          </form>
        </div>
        </div>
    );
  }

  // Forgot Password Screen
  if (screen === 'forgot-password') {
    return (
      <div className={cn(
        "min-h-screen bg-[radial-gradient(ellipse_at_top,hsl(225,12%,14%)_0%,hsl(225,8%,10%)_50%,hsl(225,6%,8%)_100%)] relative overflow-hidden flex flex-col transition-opacity duration-300",
        bgFading && "opacity-80"
      )}>
        <style>{cssAnimations}</style>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn("absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl transition-all duration-1000", mounted ? "opacity-40 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-primary/10 to-white/5 rounded-full blur-2xl transition-all duration-1000 delay-200", mounted ? "opacity-30 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/8 to-white/5 rounded-full blur-3xl transition-all duration-1000 delay-300", mounted ? "opacity-25 scale-100" : "opacity-0 scale-50")} />
        </div>

        {/* Header */}
        <div className="pt-4 px-4 safe-area-top">
          <button
            onClick={() => handleNavigate('login')}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          key={`forgot-content-${animationKey}`}
          className={cn(
            "flex-1 px-6 pt-4 pb-8 safe-area-bottom",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right",
            isShaking && "animate-shake"
          )}
        >
          {emailSent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center pt-16">
              <div className="w-20 h-20 mb-6 rounded-full bg-income/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-income" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email enviado!</h2>
              <p className="text-white/60 text-sm mb-8 max-w-xs">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <Button
                onClick={() => handleNavigate('login')}
                variant="outline"
                className="w-full h-14 text-base font-semibold rounded-full border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white"
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Recuperar senha
              </h1>
              <p className="text-white/50 text-sm mb-8">
                Digite seu e-mail para receber o link de recuperação
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-5">
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

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-base font-semibold rounded-full bg-primary/90 hover:bg-primary text-primary-foreground mt-6"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Register Screen
  if (screen === 'register') {
    return (
      <div className={cn(
        "min-h-screen bg-[radial-gradient(ellipse_at_top,hsl(225,12%,14%)_0%,hsl(225,8%,10%)_50%,hsl(225,6%,8%)_100%)] relative overflow-hidden flex flex-col transition-opacity duration-300",
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
          <div className={cn("absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl transition-all duration-1000", mounted ? "opacity-40 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute top-[15%] right-[10%] w-32 h-32 bg-gradient-to-br from-primary/10 to-white/5 rounded-full blur-2xl transition-all duration-1000 delay-200", mounted ? "opacity-30 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[20%] left-[8%] w-48 h-48 bg-gradient-to-br from-primary/8 to-white/5 rounded-full blur-3xl transition-all duration-1000 delay-300", mounted ? "opacity-25 scale-100" : "opacity-0 scale-50")} />
          <div className={cn("absolute bottom-[10%] right-[15%] w-36 h-36 bg-gradient-to-br from-white/5 to-primary/10 rounded-full blur-2xl transition-all duration-1000 delay-500", mounted ? "opacity-30 scale-100" : "opacity-0 scale-50")} />
          
          {/* Star-like dots */}
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/18 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/12 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>

        {/* Header */}
        <div className="pt-4 px-4 safe-area-top">
          <button
            onClick={handleRegisterBack}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          key={`register-content-${animationKey}-${registerStep}`}
          className={cn(
            "flex-1 px-6 pt-4 pb-8 safe-area-bottom overflow-auto",
            slideAnimation === 'slide-in-left' && "animate-slide-in-left",
            slideAnimation === 'slide-in-right' && "animate-slide-in-right",
            isShaking && "animate-shake"
          )}
        >
          {registerStep === 'method' ? (
            // Step 1: Choose method and enter email/phone
            <>
              <h1 className="text-xl font-bold text-white mb-1 leading-tight">
                Como deseja se cadastrar?
              </h1>
              <p className="text-white/50 text-sm mb-6">
                Escolha entre telefone ou e-mail
              </p>

              {/* Toggle E-mail / Telefone */}
              <div className="flex bg-sidebar-accent/60 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setRegisterMethod('email')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    registerMethod === 'email' 
                      ? "bg-sidebar-accent text-white" 
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  E-mail
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterMethod('phone')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    registerMethod === 'phone' 
                      ? "bg-sidebar-accent text-white" 
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  Telefone
                </button>
              </div>

              {/* Email or Phone input based on method */}
              <div className="space-y-2 mb-6">
                <label className="text-sm text-white/60">
                  {registerMethod === 'email' ? 'E-mail' : 'Telefone'}
                </label>
                {registerMethod === 'email' ? (
                  <Input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 px-4 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={16}
                    className="h-14 px-4 text-base bg-sidebar-accent/80 border-0 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>

              {/* Next button */}
              <Button
                type="button"
                onClick={handleRegisterNext}
                className="w-full h-14 text-base font-semibold rounded-full bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                Próximo
              </Button>

              {/* Already have account */}
              <p className="text-center text-white/50 text-sm pt-6">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => handleNavigate('login')}
                  className="text-primary font-medium"
                >
                  Entrar
                </button>
              </p>
            </>
          ) : (
            // Step 2: Name and password
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Complete seu cadastro
              </h1>
              <p className="text-white/50 text-sm mb-6">
                {registerMethod === 'email' ? email : phone}
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
              </form>
            </>
          )}
        </div>
        </div>
    );
  }

  return null;
}

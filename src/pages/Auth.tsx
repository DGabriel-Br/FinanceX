import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { NativeAuthScreens } from '@/components/auth/NativeAuthScreens';

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

// Floating particle component with forwardRef
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

export default function Auth() {
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/cadastro';
  const isForgotPasswordRoute = location.pathname === '/esqueci-senha';
  const isNativeApp = useIsNativeApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialFadeIn, setInitialFadeIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [displayedIsRegister, setDisplayedIsRegister] = useState(isRegisterRoute);
  const [displayedIsForgotPassword, setDisplayedIsForgotPassword] = useState(isForgotPasswordRoute);
  const [isShaking, setIsShaking] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user, loading, isAdmin, adminLoading, signIn, signUp, resetPassword, checkIsAdmin } = useAuthContext();
  const navigate = useNavigate();

  // Load saved email on mount (NEVER store passwords!)
  useEffect(() => {
    const savedEmail = localStorage.getItem('financex_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    // Security: Remove any legacy stored passwords
    localStorage.removeItem('financex_saved_password');
  }, []);

  // Generate random particles
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

  useEffect(() => {
    // Trigger initial fade-in animation imediatamente
    setInitialFadeIn(true);
    setMounted(true);
  }, []);

  // Handle route transitions with animation (web only)
  useEffect(() => {
    const currentView = isForgotPasswordRoute ? 'forgot' : isRegisterRoute ? 'register' : 'login';
    const displayedView = displayedIsForgotPassword ? 'forgot' : displayedIsRegister ? 'register' : 'login';
    
    if (currentView !== displayedView) {
      // Determine slide direction
      const order = ['login', 'register', 'forgot'];
      setSlideDirection(order.indexOf(currentView) > order.indexOf(displayedView) ? 'right' : 'left');
      setIsTransitioning(true);
      
      // After exit animation, update content and play enter animation
      const timer = setTimeout(() => {
        setDisplayedIsRegister(isRegisterRoute);
        setDisplayedIsForgotPassword(isForgotPasswordRoute);
        setIsTransitioning(false);
        setEmailSent(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isRegisterRoute, isForgotPasswordRoute, displayedIsRegister, displayedIsForgotPassword]);

  const handleNavigateToPage = (path: string) => {
    const goingToRegister = path === '/cadastro';
    const goingToForgot = path === '/esqueci-senha';
    setSlideDirection(goingToRegister || goingToForgot ? 'right' : 'left');
    setEmailSent(false);
    navigate(path);
  };

  useEffect(() => {
    if (!loading && !adminLoading && user) {
      // Redirect admins to admin panel, regular users to dashboard
      navigate(isAdmin ? '/admin' : '/');
    }
  }, [user, loading, isAdmin, adminLoading, navigate]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateForm = () => {
    if (isRegisterRoute && name.trim().length < 2) {
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

    if (isRegisterRoute && password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      triggerShake();
      return false;
    }

    return true;
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
    const { error } = await resetPassword(email);
    setIsLoading(false);
    
    // Always show success message for security (don't reveal if email exists)
    setEmailSent(true);
    toast.success('Se o e-mail existir em nossa base, enviaremos um link de recuperação.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    if (isRegisterRoute) {
      const { error } = await signUp(email, password, name.trim());
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
        navigate('/');
      }
    } else {
      const result = await signIn(email, password);
      setIsLoading(false);

      if (result.error) {
        triggerShake();
        
        // Show specific feedback based on login result
        if (result.blocked) {
          toast.error(`Conta bloqueada temporariamente. Aguarde ${result.remainingSeconds} segundos.`, {
            duration: 5000,
          });
        } else if (result.attemptsRemaining !== undefined && result.attemptsRemaining <= 3) {
          if (result.error.message.includes('Invalid login credentials')) {
            toast.error(`Email ou senha incorretos. ${result.attemptsRemaining} tentativa(s) restante(s).`);
          } else {
            toast.error(result.error.message);
          }
        } else if (result.error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login: ' + result.error.message);
        }
      } else {
        // Save only email if remember me is checked (NEVER save passwords!)
        if (rememberMe) {
          localStorage.setItem('financex_saved_email', email);
        } else {
          localStorage.removeItem('financex_saved_email');
        }
        toast.success('Login realizado com sucesso!');
        
        // Check if user is admin and redirect accordingly
        const adminStatus = await checkIsAdmin();
        navigate(adminStatus ? '/admin' : '/');
      }
    }
  };

  // App nativo usa o novo componente de autenticação - renderiza imediatamente sem loading
  if (isNativeApp) {
    return (
      <NativeAuthScreens
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
        onSuccess={() => navigate('/')}
      />
    );
  }

  // Se o usuário já está logado, não mostra nada enquanto redireciona
  if (user) {
    return null;
  }

  return (
    <>
      {/* Auth Form */}
      <div className={cn(
        "flex min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden",
        !initialFadeIn && "opacity-0",
        initialFadeIn && "animate-initial-fade-in"
      )}>
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* CSS Animation for particles, shake, and initial fade-in */}
        <style>{`
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
            10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
            20%, 40%, 60%, 80% { transform: translateX(8px); }
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
          .animate-initial-fade-in {
            animation: initial-fade-in 0.4s ease-out forwards;
          }
        `}</style>

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

        {/* Logo in top left with entrance animation */}
        <div 
          className={cn(
            "absolute top-6 left-6 flex items-center z-20 transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 -translate-y-8 -translate-x-4"
          )}
        >
          <div className="relative flex items-end group">
            {/* Animated glow background */}
            <div 
              className={cn(
                "absolute -inset-3 bg-gradient-to-r from-primary/20 via-income/25 to-primary/20 rounded-2xl blur-xl transition-all duration-1000 delay-300",
                mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )} 
            />
            <div 
              className={cn(
                "absolute -inset-2 bg-gradient-to-r from-income/10 via-primary/15 to-income/10 rounded-xl blur-lg animate-pulse transition-all duration-700 delay-500",
                mounted ? "opacity-100" : "opacity-0"
              )} 
            />
            
            {/* Logo with scale animation */}
            <div
              className={cn(
                "relative transition-all duration-700 delay-200 ease-out",
                mounted ? "scale-100 rotate-0" : "scale-0 -rotate-12"
              )}
            >
              <FinanceLogo size={32} className="mb-0.5 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
            </div>
            
            {/* Text with slide-in animation */}
            <span 
              className={cn(
                "text-xl font-black tracking-wider text-white -ml-1 relative transition-all duration-700 delay-400 ease-out",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
            
            {/* Shimmer effect */}
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 delay-1000",
                mounted ? "translate-x-[200%]" : "-translate-x-full"
              )}
              style={{ transitionDuration: '1.5s' }}
            />
          </div>
        </div>

        {/* Centered Card with slide transition */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-hidden">
          <div 
            className={cn(
              "w-full max-w-md bg-sidebar/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/5 transition-all duration-300 ease-out",
              mounted && !isTransitioning ? "opacity-100 scale-100 translate-x-0" : "",
              !mounted ? "opacity-0 scale-95 translate-y-8" : "",
              isTransitioning && slideDirection === 'right' ? "opacity-0 -translate-x-12" : "",
              isTransitioning && slideDirection === 'left' ? "opacity-0 translate-x-12" : "",
              isShaking && "animate-shake"
            )}
          >

            {/* Card Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {displayedIsForgotPassword 
                  ? 'Recuperar senha' 
                  : displayedIsRegister 
                    ? 'Crie sua conta' 
                    : 'Bem-vindo(a) de volta!'}
              </h1>
              <p className="text-white/60 text-sm">
                {displayedIsForgotPassword 
                  ? 'Se o e-mail existir em nossa base, enviaremos um link de recuperação.'
                  : displayedIsRegister 
                    ? 'Preencha os dados para começar a usar o FinanceX.'
                    : 'Entre com seu e-mail e senha para começar.'}
              </p>
            </div>

            {/* Forgot Password Form */}
            {displayedIsForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {emailSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-income/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-income" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email enviado!</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleNavigateToPage('/login')}
                      className="w-full h-11 text-sm font-semibold rounded-md border-white/20 bg-transparent hover:bg-white/5 text-white"
                    >
                      Voltar para o login
                    </Button>
                  </div>
                ) : (
                  <>
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

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-sm font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
                      disabled={isLoading || isTransitioning}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Enviar link de recuperação'
                      )}
                    </Button>

                    {/* Back to login */}
                    <button
                      type="button"
                      onClick={() => handleNavigateToPage('/login')}
                      className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white/70 text-sm py-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar para o login
                    </button>
                  </>
                )}
              </form>
            ) : (
              /* Login/Register Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field - only for register */}
                {displayedIsRegister && (
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
                  {displayedIsRegister && (
                    <PasswordStrengthMeter password={password} className="mt-3" />
                  )}
                </div>

                {/* Confirm Password field - only for register */}
                {displayedIsRegister && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                      Confirmar senha {!confirmPassword && <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder=""
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className={cn(
                          "h-11 px-3 pr-12 text-sm bg-sidebar-accent/80 border-0 rounded-md text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary/50",
                          confirmPassword && password !== confirmPassword && "ring-1 ring-red-500/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400">As senhas não coincidem</p>
                    )}
                    {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                      <p className="text-xs text-income">Senhas coincidem ✓</p>
                    )}
                  </div>
                )}

                {/* Remember me and Forgot password - only for login */}
                {!displayedIsRegister && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          setRememberMe(checked === true);
                          if (!checked) {
                            localStorage.removeItem('financex_saved_email');
                          }
                        }}
                        className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label 
                        htmlFor="remember-me" 
                        className="text-white/70 text-xs cursor-pointer select-none"
                      >
                        Lembrar-me
                      </label>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleNavigateToPage('/esqueci-senha')}
                        className="text-primary hover:underline text-xs font-medium transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
                  disabled={isLoading || isTransitioning}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    displayedIsRegister ? 'Criar conta' : 'Entrar'
                  )}
                </Button>

                {/* Bottom link */}
                <p className="text-white/50 text-xs text-center pt-2">
                  {displayedIsRegister ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                  <button
                    type="button"
                    onClick={() => handleNavigateToPage(displayedIsRegister ? '/login' : '/cadastro')}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {displayedIsRegister ? 'Entrar' : 'Cadastre-se agora.'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

    </>
  );
}

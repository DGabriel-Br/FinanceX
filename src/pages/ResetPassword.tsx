import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

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

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { updatePassword, session } = useAuthContext();
  const navigate = useNavigate();

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
    setMounted(true);
  }, []);

  // Check if user has a recovery session
  useEffect(() => {
    if (!session) {
      // Give some time for the session to be established from the URL hash
      const timer = setTimeout(() => {
        if (!session) {
          toast.error('Link de recuperação inválido ou expirado');
          navigate('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      triggerShake();
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      triggerShake();
      toast.error('Erro ao redefinir senha: ' + error.message);
    } else {
      setIsSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sidebar via-[hsl(220,50%,15%)] to-primary/30 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}
      </div>

      {/* CSS Animation for particles and shake */}
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
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
        
        {/* Star-like dots */}
        <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-white/35 rounded-full animate-pulse delay-500" />
        <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-700" />
      </div>

      {/* Logo in top left */}
      <div 
        className={cn(
          "absolute top-6 left-6 flex items-center z-20 transition-all duration-1000 ease-out",
          mounted ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0 -translate-y-8 -translate-x-4"
        )}
      >
        <div className="relative flex items-end group">
          <div 
            className={cn(
              "absolute -inset-3 bg-gradient-to-r from-primary/20 via-income/25 to-primary/20 rounded-2xl blur-xl transition-all duration-1000 delay-300",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )} 
          />
          <div
            className={cn(
              "relative transition-all duration-700 delay-200 ease-out",
              mounted ? "scale-100 rotate-0" : "scale-0 -rotate-12"
            )}
          >
            <FinanceLogo size={32} className="mb-0.5 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
          </div>
          <span 
            className={cn(
              "text-xl font-black tracking-wider text-white -ml-1 relative transition-all duration-700 delay-400 ease-out",
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            inanceX
          </span>
        </div>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-hidden">
        <div 
          className={cn(
            "w-full max-w-md bg-sidebar/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/5 transition-all duration-300 ease-out",
            mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8",
            isShaking && "animate-shake"
          )}
        >
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-income/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-income" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Senha redefinida!</h3>
              <p className="text-white/60 text-sm mb-6">
                Sua senha foi alterada com sucesso. Redirecionando...
              </p>
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Criar nova senha
                </h1>
                <p className="text-white/60 text-sm">
                  Digite sua nova senha abaixo
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password field */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    Nova senha {!password && <span className="text-red-400">*</span>}
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
                  <PasswordStrengthMeter password={password} className="mt-3" />
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    Confirmar nova senha {!confirmPassword && <span className="text-red-400">*</span>}
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

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Redefinir senha'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

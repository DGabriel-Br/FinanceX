import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
}

export const PasswordStrengthMeter = ({ password, className }: PasswordStrengthMeterProps) => {
  const criteria: PasswordCriteria[] = useMemo(() => [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Número', met: /[0-9]/.test(password) },
    { label: 'Caractere especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = criteria.filter(c => c.met).length;
    if (metCount === 0) return { level: 0, label: '', color: '' };
    if (metCount === 1) return { level: 1, label: 'Muito fraca', color: 'bg-red-500' };
    if (metCount === 2) return { level: 2, label: 'Fraca', color: 'bg-orange-500' };
    if (metCount === 3) return { level: 3, label: 'Razoável', color: 'bg-yellow-500' };
    if (metCount === 4) return { level: 4, label: 'Boa', color: 'bg-lime-500' };
    return { level: 5, label: 'Forte', color: 'bg-income' };
  }, [criteria]);

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          {strength.label && (
            <span className={cn(
              "font-medium transition-colors",
              strength.level === 1 && "text-red-500",
              strength.level === 2 && "text-orange-500",
              strength.level === 3 && "text-yellow-500",
              strength.level === 4 && "text-income"
            )}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                level <= strength.level ? strength.color : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Criteria list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {criteria.map((criterion, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-200",
              criterion.met ? "text-income" : "text-muted-foreground"
            )}
          >
            {criterion.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            <span>{criterion.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

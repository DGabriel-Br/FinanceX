import { memo } from 'react';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface HeroCardProps {
  sobraValue: number;
  isPositive: boolean;
  daysUntilNegative: number | null;
  showValues: boolean;
  formatValue: (value: number) => string;
}

export const HeroCard = memo(({
  sobraValue,
  isPositive,
  daysUntilNegative,
  showValues,
  formatValue
}: HeroCardProps) => {
  const displayValue = showValues ? formatValue(sobraValue) : '••••••';
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 md:p-8 shadow-lg
        animate-fade-in border
        ${isPositive 
          ? 'bg-gradient-to-br from-income/10 via-income/5 to-card border-income/20' 
          : 'bg-gradient-to-br from-expense/10 via-expense/5 to-card border-expense/20'
        }
      `}
      style={{ animationDuration: '0.5s' }}
    >
      {/* Background decoration */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 ${isPositive ? 'bg-income' : 'bg-expense'}`} />
      
      <div className="relative z-10">
        {/* Icon and label */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPositive ? 'bg-income/20' : 'bg-expense/20'}`}>
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-income" />
            ) : (
              <TrendingDown className="w-6 h-6 text-expense" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sobra para gastar este mês</p>
            <p className="text-xs text-muted-foreground/70">No ritmo atual</p>
          </div>
        </div>
        
        {/* Main value */}
        <div className={`text-4xl md:text-5xl font-bold tracking-tight ${isPositive ? 'text-income' : 'text-expense'}`}>
          {displayValue}
        </div>
        
        {/* Alert for negative projection */}
        {!isPositive && daysUntilNegative !== null && daysUntilNegative > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-expense/10 border border-expense/20">
            <AlertTriangle className="w-4 h-4 text-expense" />
            <span className="text-sm text-expense">
              Atenção: saldo pode ficar negativo em {daysUntilNegative} dia{daysUntilNegative !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Footer text */}
        <p className="text-xs text-muted-foreground/60 mt-4">
          Atualizado a cada gasto lançado
        </p>
      </div>
    </div>
  );
});

HeroCard.displayName = 'HeroCard';

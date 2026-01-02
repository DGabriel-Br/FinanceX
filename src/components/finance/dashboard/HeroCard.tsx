import { memo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle } from 'lucide-react';

export type HeroCardStatus = 'positive' | 'warning' | 'negative';

interface HeroCardProps {
  sobraValue: number;
  status: HeroCardStatus;
  daysUntilNegative: number | null;
  showValues: boolean;
  formatValue: (value: number) => string;
}

const statusStyles = {
  positive: {
    gradient: 'bg-gradient-to-br from-income/10 via-income/5 to-card border-income/20',
    glow: 'bg-income',
    iconBg: 'bg-income/20',
    text: 'text-income',
  },
  warning: {
    gradient: 'bg-gradient-to-br from-warning/10 via-warning/5 to-card border-warning/20',
    glow: 'bg-warning',
    iconBg: 'bg-warning/20',
    text: 'text-warning',
  },
  negative: {
    gradient: 'bg-gradient-to-br from-expense/10 via-expense/5 to-card border-expense/20',
    glow: 'bg-expense',
    iconBg: 'bg-expense/20',
    text: 'text-expense',
  },
};

const StatusIcon = ({ status }: { status: HeroCardStatus }) => {
  const iconClass = `w-6 h-6 ${statusStyles[status].text}`;
  
  switch (status) {
    case 'positive':
      return <TrendingUp className={iconClass} />;
    case 'warning':
      return <AlertCircle className={iconClass} />;
    case 'negative':
      return <TrendingDown className={iconClass} />;
  }
};

export const HeroCard = memo(({
  sobraValue,
  status,
  daysUntilNegative,
  showValues,
  formatValue
}: HeroCardProps) => {
  const displayValue = showValues ? formatValue(sobraValue) : '••••••';
  const styles = statusStyles[status];
  const shouldPulse = status === 'warning' || status === 'negative';
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 md:p-8 shadow-lg
        animate-fade-in border transition-all duration-500 ease-out
        ${styles.gradient}
      `}
      style={{ animationDuration: '0.5s' }}
    >
      {/* Background decoration with pulse effect */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${styles.glow} ${shouldPulse ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`} />
      
      <div className="relative z-10">
        {/* Icon and label */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${styles.iconBg}`}>
            <StatusIcon status={status} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sobra para gastar este mês</p>
            <p className="text-xs text-muted-foreground/70">No ritmo atual</p>
          </div>
        </div>
        
        {/* Main value */}
        <div className={`text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-500 ${styles.text}`}>
          {displayValue}
        </div>
        
        {/* Alert for warning state */}
        {status === 'warning' && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 animate-[pulse_3s_ease-in-out_infinite]">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">
              Atenção: você já gastou mais de 60% da sua receita
            </span>
          </div>
        )}
        
        {/* Alert for negative balance */}
        {status === 'negative' && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-expense/10 border border-expense/20 animate-[pulse_3s_ease-in-out_infinite]">
            <AlertTriangle className="w-4 h-4 text-expense animate-[shake_0.5s_ease-in-out_infinite]" />
            <span className="text-sm text-expense">
              {daysUntilNegative !== null && daysUntilNegative > 0 
                ? `Atenção: saldo pode ficar negativo em ${daysUntilNegative} dia${daysUntilNegative !== 1 ? 's' : ''}`
                : 'Atenção: você já gastou mais do que recebeu este mês'
              }
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

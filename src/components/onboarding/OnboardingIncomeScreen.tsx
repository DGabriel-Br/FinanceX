import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingIncomeScreenProps {
  onContinue: (income: number) => void;
}

const INCOME_SUGGESTIONS = [2000, 3000, 5000, 8000];

export const OnboardingIncomeScreen = ({ onContinue }: OnboardingIncomeScreenProps) => {
  const [value, setValue] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (val: string) => {
    // Remove tudo exceto números e vírgula
    let cleaned = val.replace(/[^\d,]/g, '');
    
    // Garante apenas uma vírgula
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita centavos a 2 dígitos
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + ',' + parts[1].slice(0, 2);
    }
    
    // Formata a parte inteira com separador de milhar
    if (parts[0]) {
      const intPart = parseInt(parts[0], 10);
      if (!isNaN(intPart)) {
        cleaned = intPart.toLocaleString('pt-BR') + (parts.length > 1 ? ',' + parts[1] : '');
      }
    }
    
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue(formatted);
    setSelectedSuggestion(null);
  };

  const parseValue = (val: string): number => {
    // Remove pontos de milhar e troca vírgula por ponto
    const normalized = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleSuggestionClick = (amount: number) => {
    setValue(amount.toLocaleString('pt-BR'));
    setSelectedSuggestion(amount);
  };

  const handleContinue = () => {
    const numericValue = parseValue(value);
    if (numericValue > 0) {
      onContinue(numericValue);
    }
  };

  const numericValue = parseValue(value);
  const isValid = numericValue > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Icon */}
      <div className="mb-6 p-3 rounded-xl bg-income/10 animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <Wallet className="w-8 h-8 text-income" />
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        Quanto você recebe por mês?
      </h2>

      {/* Sub */}
      <p className="text-muted-foreground text-sm mb-8 text-center max-w-xs animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        Pode ser aproximado. Dá pra ajustar depois.
      </p>

      {/* Input de valor */}
      <div className="w-full max-w-xs mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
            R$
          </span>
          <Input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            placeholder="0"
            className="h-14 text-2xl font-semibold pl-12 text-center"
          />
        </div>
      </div>

      {/* Sugestões rápidas */}
      <div className="flex justify-center gap-2 mb-10 w-full max-w-sm animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        {INCOME_SUGGESTIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleSuggestionClick(amount)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              selectedSuggestion === amount
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            R$ {amount.toLocaleString('pt-BR')}
          </button>
        ))}
      </div>

      {/* CTA */}
      <Button 
        onClick={handleContinue} 
        disabled={!isValid}
        size="lg" 
        className="w-full max-w-xs h-14 text-lg font-semibold animate-fade-in opacity-0 hover:scale-105 transition-transform"
        style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
      >
        Continuar
      </Button>
    </div>
  );
};

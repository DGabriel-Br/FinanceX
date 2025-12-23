import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionType } from '@/types/transaction';
import { getLocalDateString } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  onSubmit: (transaction: {
    type: TransactionType;
    date: string;
    description: string;
    value: number;
  }) => void;
}

// Formata número para moeda brasileira (ex: 1.234,56)
const formatCurrency = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers, 10) / 100;
  
  // Formata com separadores brasileiros
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte string formatada para número
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

export const TransactionForm = ({ onSubmit }: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>('despesa');
  const [date, setDate] = useState(getLocalDateString());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericValue = parseCurrency(value);
    
    // Validação básica
    if (!description.trim() || numericValue <= 0) {
      return;
    }

    onSubmit({
      type,
      date,
      description: description.trim(),
      value: numericValue,
    });

    // Limpar formulário
    setDescription('');
    setValue('');
  };

  const numericValue = parseCurrency(value);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Novo Lançamento</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('receita')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border',
                type === 'receita'
                  ? 'bg-income/10 text-income border-income'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
              )}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('despesa')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border',
                type === 'despesa'
                  ? 'bg-expense/10 text-expense border-expense'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
              )}
            >
              Despesa
            </button>
          </div>
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Salário, Aluguel, Mercado..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleValueChange}
            placeholder="0,00"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={!description.trim() || numericValue <= 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>
    </div>
  );
};

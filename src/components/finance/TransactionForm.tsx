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

export const TransactionForm = ({ onSubmit }: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>('despesa');
  const [date, setDate] = useState(getLocalDateString());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!description.trim() || !value || parseFloat(value) <= 0) {
      return;
    }

    onSubmit({
      type,
      date,
      description: description.trim(),
      value: parseFloat(value),
    });

    // Limpar formulário
    setDescription('');
    setValue('');
  };

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
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="0,00"
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={!description.trim() || !value || parseFloat(value) <= 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>
    </div>
  );
};

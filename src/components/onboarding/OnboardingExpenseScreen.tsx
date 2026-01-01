import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Receipt } from 'lucide-react';
import { ExpenseCategory, expenseCategoryLabels } from '@/types/transaction';

interface OnboardingExpenseScreenProps {
  onSave: (expense: { value: number; category: ExpenseCategory }) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'mercado',
  'delivery',
  'transporte',
  'contas_fixas',
  'educacao',
  'outros_despesa',
];

export const OnboardingExpenseScreen = ({ onSave }: OnboardingExpenseScreenProps) => {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('outros_despesa');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (val: string) => {
    const numbers = val.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10);
    return amount.toLocaleString('pt-BR');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue(formatted);
  };

  const handleSave = () => {
    const numericValue = parseInt(value.replace(/\D/g, ''), 10);
    if (numericValue > 0) {
      onSave({ value: numericValue, category });
    }
  };

  const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
  const isValid = numericValue > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Icon */}
      <div className="mb-6 p-3 rounded-xl bg-expense/10">
        <Receipt className="w-8 h-8 text-expense" />
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-center">
        Agora, um gasto recente qualquer.
      </h2>

      {/* Sub */}
      <p className="text-muted-foreground text-sm mb-8 text-center max-w-xs">
        Não precisa ser exato. Só pra gente começar.
      </p>

      {/* Input de valor */}
      <div className="w-full max-w-xs mb-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
            R$
          </span>
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleInputChange}
            placeholder="0"
            className="h-14 text-2xl font-semibold pl-12 text-center"
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="w-full max-w-xs mb-10">
        <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {expenseCategoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CTA */}
      <Button 
        onClick={handleSave} 
        disabled={!isValid}
        size="lg" 
        className="w-full max-w-xs h-14 text-lg font-semibold"
      >
        Salvar gasto
      </Button>
    </div>
  );
};

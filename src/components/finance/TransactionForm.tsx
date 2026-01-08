import { useState, useEffect } from 'react';
import { Plus, CalendarIcon, AlertCircle } from 'lucide-react';
import { 
  TransactionType, 
  TransactionCategory, 
  IncomeCategory, 
  ExpenseCategory,
  incomeCategoryLabels,
  expenseCategoryLabels,
  incomeCategoryIcons,
  expenseCategoryIcons
} from '@/types/transaction';
import { 
  InvestmentType, 
  investmentTypeLabels, 
  investmentTypeIcons,
  VALID_INVESTMENT_TYPES 
} from '@/types/investment';
import { encodeInvestmentDescription } from '@/core/finance/investmentMetadata';
import { getLocalDateString } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyInput, parseCurrency } from '@/lib/currency';
import { transactionSchema, getFieldError } from '@/lib/validations/finance';
import { z } from 'zod';

interface TransactionFormProps {
  onSubmit: (transaction: {
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    description: string;
    value: number;
  }) => void;
}

const incomeCategories: IncomeCategory[] = ['salario', '13_salario', 'ferias', 'freelance', 'outros_receita'];
const expenseCategories: ExpenseCategory[] = ['contas_fixas', 'investimentos', 'dividas', 'educacao', 'transporte', 'mercado', 'delivery', 'outros_despesa'];

export const TransactionForm = ({ onSubmit }: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>('despesa');
  const [category, setCategory] = useState<TransactionCategory>('contas_fixas');
  const [investmentType, setInvestmentType] = useState<InvestmentType>('reserva_emergencia');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Atualizar categoria quando tipo mudar
  useEffect(() => {
    if (type === 'receita') {
      setCategory('salario');
    } else {
      setCategory('contas_fixas');
    }
  }, [type]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setValue(formatted);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const formData = {
      type,
      category,
      date: getLocalDateString(selectedDate),
      description: description.trim(),
      value: parseCurrency(value),
    };

    const result = transactionSchema.safeParse(formData);
    
    if (!result.success) {
      setErrors(result.error);
      return null;
    }
    
    setErrors(null);
    return result.data;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos os campos como tocados
    setTouched({
      description: true,
      value: true,
    });

    const validatedData = validateForm();
    if (!validatedData) return;

    // Se for investimento, codificar o tipo na descrição
    const finalDescription = category === 'investimentos'
      ? encodeInvestmentDescription(investmentType, validatedData.description, false)
      : validatedData.description;

    onSubmit({
      type: validatedData.type as TransactionType,
      category: validatedData.category as TransactionCategory,
      date: validatedData.date,
      description: finalDescription,
      value: validatedData.value,
    });

    // Limpar formulário
    setDescription('');
    setValue('');
    setInvestmentType('reserva_emergencia');
    setErrors(null);
    setTouched({});
  };

  const currentCategories = type === 'receita' ? incomeCategories : expenseCategories;
  const categoryLabels = type === 'receita' ? incomeCategoryLabels : expenseCategoryLabels;

  const descriptionError = touched.description ? getFieldError(errors, 'description') : undefined;
  const valueError = touched.value ? getFieldError(errors, 'value') : undefined;

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

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {currentCategories.map(cat => {
              const Icon = type === 'receita' 
                ? incomeCategoryIcons[cat as IncomeCategory]
                : expenseCategoryIcons[cat as ExpenseCategory];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left',
                    isSelected
                      ? type === 'receita'
                        ? 'bg-income/10 text-income border-income'
                        : 'bg-expense/10 text-expense border-expense'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{categoryLabels[cat as keyof typeof categoryLabels]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tipo de Investimento (apenas quando categoria é investimentos) */}
        {category === 'investimentos' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de Investimento</label>
            <div className="grid grid-cols-2 gap-2">
              {VALID_INVESTMENT_TYPES.map(invType => {
                const Icon = investmentTypeIcons[invType];
                const isSelected = investmentType === invType;
                return (
                  <button
                    key={invType}
                    type="button"
                    onClick={() => setInvestmentType(invType)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left',
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{investmentTypeLabels[invType]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Ex: Salário, Aluguel, Mercado..."
            className={cn(
              "w-full h-11 lg:h-10 px-3 rounded-lg border bg-background text-foreground text-base lg:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              descriptionError ? "border-expense" : "border-input"
            )}
          />
          {descriptionError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {descriptionError}
            </p>
          )}
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleValueChange}
            onBlur={() => handleBlur('value')}
            placeholder="0,00"
            className={cn(
              "w-full h-11 lg:h-10 px-3 rounded-lg border bg-background text-foreground text-base lg:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              valueError ? "border-expense" : "border-input"
            )}
          />
          {valueError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {valueError}
            </p>
          )}
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 h-11 lg:h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 touch-target"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>
    </div>
  );
};

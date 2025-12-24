import { useState, useEffect } from 'react';
import { Plus, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { getLocalDateString } from '@/hooks/useTransactions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FloatingAddButtonProps {
  onAddTransaction: (transaction: {
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    description: string;
    value: number;
  }) => void;
}

const incomeCategories: IncomeCategory[] = ['salario', '13_salario', 'ferias', 'freelance', 'outros_receita'];
const expenseCategories: ExpenseCategory[] = ['contas_fixas', 'investimentos', 'dividas', 'educacao', 'transporte', 'mercado', 'delivery', 'outros_despesa'];

const formatCurrency = (val: string): string => {
  const numbers = val.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (val: string): number => {
  if (!val) return 0;
  const normalized = val.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

export const FloatingAddButton = ({ onAddTransaction }: FloatingAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('despesa');
  const [category, setCategory] = useState<TransactionCategory>('contas_fixas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Atualizar categoria quando tipo mudar
  useEffect(() => {
    if (type === 'receita') {
      setCategory('salario');
    } else {
      setCategory('contas_fixas');
    }
  }, [type]);

  // Reset form when sheet closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setType('despesa');
      setCategory('contas_fixas');
      setSelectedDate(new Date());
      setDescription('');
      setValue('');
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue(formatted);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericValue = parseCurrency(value);
    
    if (!description.trim() || numericValue <= 0) {
      return;
    }

    onAddTransaction({
      type,
      category,
      date: getLocalDateString(selectedDate),
      description: description.trim(),
      value: numericValue,
    });

    handleOpenChange(false);
  };

  const numericValue = parseCurrency(value);
  const currentCategories = type === 'receita' ? incomeCategories : expenseCategories;
  const categoryLabels = type === 'receita' ? incomeCategoryLabels : expenseCategoryLabels;
  const categoryIcons = type === 'receita' ? incomeCategoryIcons : expenseCategoryIcons;

  return (
    <>
      {/* Floating Action Button - apenas mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "md:hidden fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-105 hover:shadow-xl",
          "active:scale-95"
        )}
        aria-label="Adicionar lançamento"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Sheet com formulário */}
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novo Lançamento
            </SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border',
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
                    'flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border',
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
                {currentCategories.map((cat) => {
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
                        'flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 border text-left',
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

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
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
                placeholder="Ex: Salário, Aluguel, Mercado..."
                className="w-full px-3 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full px-3 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={!description.trim() || numericValue <= 0}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Adicionar Lançamento
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

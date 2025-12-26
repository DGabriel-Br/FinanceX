import React, { useState, forwardRef } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrencyInput, parseCurrency } from '@/lib/currency';
import { Debt } from '@/types/debt';

interface DebtFormProps {
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const DebtForm = forwardRef<HTMLFormElement, DebtFormProps>(
  ({ onSubmit, onClose }, ref) => {
    const [name, setName] = useState('');
    const [totalValue, setTotalValue] = useState('');
    const [monthlyInstallment, setMonthlyInstallment] = useState('');
    const [paidValue, setPaidValue] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setSelectedDate(startOfMonth(date));
        setCalendarOpen(false);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numericTotal = parseCurrency(totalValue);
      const numericMonthly = parseCurrency(monthlyInstallment);
      const numericPaid = parseCurrency(paidValue);
      if (!name.trim() || numericTotal <= 0 || numericMonthly <= 0 || !selectedDate) return;

      const startDate = format(selectedDate, 'yyyy-MM');

      onSubmit({
        name: name.trim(),
        totalValue: numericTotal,
        monthlyInstallment: numericMonthly,
        paidValue: numericPaid,
        startDate,
      });

      setName('');
      setTotalValue('');
      setMonthlyInstallment('');
      setPaidValue('');
      setSelectedDate(undefined);
      onClose();
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nome da Dívida</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Empréstimo, Financiamento..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor Total (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={totalValue}
            onChange={e => setTotalValue(formatCurrencyInput(e.target.value))}
            placeholder="0,00"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Parcela Mensal (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={monthlyInstallment}
            onChange={e => setMonthlyInstallment(formatCurrencyInput(e.target.value))}
            placeholder="0,00"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor Já Pago (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={paidValue}
            onChange={e => setPaidValue(formatCurrencyInput(e.target.value))}
            placeholder="0,00"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data de Início</label>
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
                {selectedDate ? format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione o mês de início</span>}
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

        <button
          type="submit"
          disabled={!name.trim() || parseCurrency(totalValue) <= 0 || parseCurrency(monthlyInstallment) <= 0 || !selectedDate}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Adicionar Dívida
        </button>
      </form>
    );
  }
);

DebtForm.displayName = 'DebtForm';

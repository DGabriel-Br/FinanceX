import React, { useState, forwardRef } from 'react';
import { Plus, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrencyInput, parseCurrency } from '@/lib/currency';
import { Debt } from '@/types/debt';
import { debtSchema, getFieldError } from '@/lib/validations/finance';
import { z } from 'zod';

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
    const [errors, setErrors] = useState<z.ZodError | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setSelectedDate(startOfMonth(date));
        setCalendarOpen(false);
        setTouched(prev => ({ ...prev, startDate: true }));
      }
    };

    const handleBlur = (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = () => {
      const formData = {
        name: name.trim(),
        totalValue: parseCurrency(totalValue),
        monthlyInstallment: parseCurrency(monthlyInstallment),
        paidValue: parseCurrency(paidValue) || 0,
        startDate: selectedDate ? format(selectedDate, 'yyyy-MM') : '',
      };

      const result = debtSchema.safeParse(formData);
      
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
        name: true,
        totalValue: true,
        monthlyInstallment: true,
        paidValue: true,
        startDate: true,
      });

      const validatedData = validateForm();
      if (!validatedData) return;

      onSubmit({
        name: validatedData.name,
        totalValue: validatedData.totalValue,
        monthlyInstallment: validatedData.monthlyInstallment,
        paidValue: validatedData.paidValue,
        startDate: validatedData.startDate,
      });

      // Limpar formulário
      setName('');
      setTotalValue('');
      setMonthlyInstallment('');
      setPaidValue('');
      setSelectedDate(undefined);
      setErrors(null);
      setTouched({});
      onClose();
    };

    const nameError = touched.name ? getFieldError(errors, 'name') : undefined;
    const totalValueError = touched.totalValue ? getFieldError(errors, 'totalValue') : undefined;
    const monthlyInstallmentError = touched.monthlyInstallment ? getFieldError(errors, 'monthlyInstallment') : undefined;
    const paidValueError = touched.paidValue ? getFieldError(errors, 'paidValue') : undefined;
    const startDateError = touched.startDate ? getFieldError(errors, 'startDate') : undefined;

    return (
      <form ref={ref} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nome da Dívida</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Ex: Empréstimo, Financiamento..."
            className={cn(
              "w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              nameError ? "border-expense" : "border-input"
            )}
          />
          {nameError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor Total (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={totalValue}
            onChange={e => setTotalValue(formatCurrencyInput(e.target.value))}
            onBlur={() => handleBlur('totalValue')}
            placeholder="0,00"
            className={cn(
              "w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              totalValueError ? "border-expense" : "border-input"
            )}
          />
          {totalValueError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {totalValueError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Parcela Mensal (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={monthlyInstallment}
            onChange={e => setMonthlyInstallment(formatCurrencyInput(e.target.value))}
            onBlur={() => handleBlur('monthlyInstallment')}
            placeholder="0,00"
            className={cn(
              "w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              monthlyInstallmentError ? "border-expense" : "border-input"
            )}
          />
          {monthlyInstallmentError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {monthlyInstallmentError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Valor Já Pago (R$)</label>
          <input
            type="text"
            inputMode="numeric"
            value={paidValue}
            onChange={e => setPaidValue(formatCurrencyInput(e.target.value))}
            onBlur={() => handleBlur('paidValue')}
            placeholder="0,00"
            className={cn(
              "w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              paidValueError ? "border-expense" : "border-input"
            )}
          />
          {paidValueError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {paidValueError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data de Início</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                  startDateError && "border-expense"
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
          {startDateError && (
            <p className="mt-1 text-xs text-expense flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {startDateError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Adicionar Dívida
        </button>
      </form>
    );
  }
);

DebtForm.displayName = 'DebtForm';

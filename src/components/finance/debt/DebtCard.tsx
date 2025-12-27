import React, { useState, forwardRef } from 'react';
import { Trash2, CreditCard, Calendar as CalendarIcon, TrendingUp, CheckCircle, Pencil, Save, X } from 'lucide-react';
import { Debt, calculateExpectedEndDate, calculateProgress } from '@/types/debt';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyInput, parseCurrency, formatNumberToCurrency } from '@/lib/currency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Formata data YYYY-MM para exibição
const formatMonthYear = (date: string): string => {
  const [year, month] = date.split('-');
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[parseInt(month) - 1]}/${year}`;
};

interface DebtCardProps {
  debt: Debt;
  paidValue: number;
  onUpdate: (updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void;
  onDelete: () => void;
  displayValue: (value: number) => string;
}

export const DebtCard = forwardRef<HTMLDivElement, DebtCardProps>(
  ({ debt, paidValue, onUpdate, onDelete, displayValue }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editName, setEditName] = useState(debt.name);
    const [editTotalValue, setEditTotalValue] = useState(formatNumberToCurrency(debt.totalValue));
    const [editMonthlyInstallment, setEditMonthlyInstallment] = useState(formatNumberToCurrency(debt.monthlyInstallment));
    const [editPaidValue, setEditPaidValue] = useState(formatNumberToCurrency(debt.paidValue));
    const [editDate, setEditDate] = useState<Date | undefined>(() => {
      const [year, month] = debt.startDate.split('-').map(Number);
      return new Date(year, month - 1);
    });
    const [calendarOpen, setCalendarOpen] = useState(false);

    const remaining = debt.totalValue - paidValue;
    const progress = calculateProgress(debt.totalValue, paidValue);
    const expectedEndDate = calculateExpectedEndDate(debt.totalValue, debt.monthlyInstallment, debt.startDate, paidValue);

    const handleDeleteClick = () => {
      setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
      onDelete();
      setShowDeleteConfirm(false);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setEditDate(startOfMonth(date));
        setCalendarOpen(false);
      }
    };

    const handleSave = () => {
      const numericTotal = parseCurrency(editTotalValue);
      const numericMonthly = parseCurrency(editMonthlyInstallment);
      const numericPaid = parseCurrency(editPaidValue);
      
      if (!editName.trim() || numericTotal <= 0 || numericMonthly <= 0 || !editDate) return;

      onUpdate({
        name: editName.trim(),
        totalValue: numericTotal,
        monthlyInstallment: numericMonthly,
        paidValue: numericPaid,
        startDate: format(editDate, 'yyyy-MM'),
      });
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditName(debt.name);
      setEditTotalValue(formatNumberToCurrency(debt.totalValue));
      setEditMonthlyInstallment(formatNumberToCurrency(debt.monthlyInstallment));
      setEditPaidValue(formatNumberToCurrency(debt.paidValue));
      const [year, month] = debt.startDate.split('-').map(Number);
      setEditDate(new Date(year, month - 1));
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div ref={ref} className="bg-card border border-primary/50 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome da Dívida</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Valor Total (R$)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editTotalValue}
                  onChange={e => setEditTotalValue(formatCurrencyInput(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parcela Mensal (R$)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editMonthlyInstallment}
                  onChange={e => setEditMonthlyInstallment(formatCurrencyInput(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Valor Já Pago (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editPaidValue}
                onChange={e => setEditPaidValue(formatCurrencyInput(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                      !editDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione o mês</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!editName.trim() || parseCurrency(editTotalValue) <= 0 || parseCurrency(editMonthlyInstallment) <= 0 || !editDate}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border text-foreground font-medium text-sm transition-all duration-200 hover:bg-muted"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{debt.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="w-3 h-3" />
                <span>Início: {formatMonthYear(debt.startDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-muted-foreground hover:text-expense hover:bg-expense/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Pago até agora</p>
            <p className="font-semibold text-income text-sm">{displayValue(paidValue)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Falta pagar</p>
            <p className="font-semibold text-expense text-sm">{displayValue(Math.max(0, remaining))}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
            <p className="font-semibold text-foreground text-sm">{displayValue(debt.totalValue)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Parcela Mensal</p>
            <p className="font-semibold text-primary text-sm">{displayValue(debt.monthlyInstallment)}</p>
          </div>
        </div>

        {/* Previsão de Término / Quitação */}
        {progress >= 100 ? (
          <div className="flex items-center justify-center gap-2 p-3 bg-income/10 rounded-lg border border-income/30">
            <CheckCircle className="w-4 h-4 text-income" />
            <span className="text-sm text-foreground">
              Dívida quitada em <strong>{formatMonthYear(expectedEndDate)}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              Previsão de término: <strong>{formatMonthYear(expectedEndDate)}</strong>
            </span>
          </div>
        )}

        {/* Dica */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          💡 Registre pagamentos na aba Lançamentos com categoria "Dívidas" e inclua "{debt.name}" na descrição.
        </p>

        {/* Diálogo de confirmação de exclusão */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir dívida?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a dívida "{debt.name}" no valor total de {displayValue(debt.totalValue)}?
                <br /><br />
                Esta ação não pode ser desfeita. Os lançamentos de pagamentos relacionados não serão excluídos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-expense hover:bg-expense/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

DebtCard.displayName = 'DebtCard';

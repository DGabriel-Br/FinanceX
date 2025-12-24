import { useState } from 'react';
import { Plus, Trash2, CreditCard, Calendar as CalendarIcon, TrendingUp, CheckCircle, Pencil, Save, X } from 'lucide-react';
import { Debt, calculateExpectedEndDate, calculateProgress } from '@/types/debt';
import { Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DebtsProps {
  debts: Debt[];
  transactions: Transaction[];
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onUpdateDebt: (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void;
  onDeleteDebt: (id: string) => void;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata número para moeda brasileira (ex: 1.234,56)
const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte string formatada para número
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

// Formata data YYYY-MM para exibição
const formatMonthYear = (date: string): string => {
  const [year, month] = date.split('-');
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[parseInt(month) - 1]}/${year}`;
};

// Calcula valor pago de uma dívida com base nas transações + valor inicial
const getTotalPaidValue = (debt: Debt, transactions: Transaction[]): number => {
  const transactionsPaid = transactions
    .filter(t => t.type === 'despesa' && t.category === 'dividas' && 
            t.description.toLowerCase().includes(debt.name.toLowerCase()))
    .reduce((sum, t) => sum + t.value, 0);
  return debt.paidValue + transactionsPaid;
};

// Formulário de Nova Dívida
const DebtForm = ({ onSubmit, onClose }: { onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void; onClose: () => void }) => {
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

    // Formata a data como YYYY-MM
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
};

// Card de Dívida Individual
const DebtCard = ({ 
  debt, 
  paidValue,
  onUpdate,
  onDelete,
}: { 
  debt: Debt; 
  paidValue: number;
  onUpdate: (updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
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
      <div className="bg-card border border-primary/50 rounded-xl p-6 shadow-sm">
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
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
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
            onClick={onDelete}
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
          <p className="font-semibold text-income text-sm">{formatCurrency(paidValue)}</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Falta pagar</p>
          <p className="font-semibold text-expense text-sm">{formatCurrency(Math.max(0, remaining))}</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
          <p className="font-semibold text-foreground text-sm">{formatCurrency(debt.totalValue)}</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Parcela Mensal</p>
          <p className="font-semibold text-primary text-sm">{formatCurrency(debt.monthlyInstallment)}</p>
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
    </div>
  );
};

// Helper para formatar número para input de moeda
const formatNumberToCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const Debts = ({ 
  debts, 
  transactions,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt, 
}: DebtsProps) => {
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);

  // Calcula estatísticas gerais
  const stats = debts.reduce((acc, debt) => {
    const paidValue = getTotalPaidValue(debt, transactions);
    return {
      totalDebt: acc.totalDebt + debt.totalValue,
      totalPaid: acc.totalPaid + paidValue,
      totalRemaining: acc.totalRemaining + Math.max(0, debt.totalValue - paidValue),
    };
  }, { totalDebt: 0, totalPaid: 0, totalRemaining: 0 });

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in"
        style={{ animationDelay: '0.05s' }}
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Controle de Dívidas</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie e acompanhe suas dívidas</p>
        </div>
        
        <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Nova Dívida
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Dívida</DialogTitle>
            </DialogHeader>
            <DebtForm onSubmit={onAddDebt} onClose={() => setIsDebtDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Total em Dívidas</p>
          <p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(stats.totalDebt)}</p>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Total Pago</p>
          <p className="text-lg md:text-xl font-bold text-income">{formatCurrency(stats.totalPaid)}</p>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Falta Pagar</p>
          <p className="text-lg md:text-xl font-bold text-expense">{formatCurrency(stats.totalRemaining)}</p>
        </div>
      </div>

      {/* Aviso sobre como registrar pagamentos */}
      <div 
        className="mb-6 p-4 bg-muted/50 rounded-lg border border-border opacity-0 animate-fade-in"
        style={{ animationDelay: '0.25s' }}
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Como funciona:</strong> Os valores pagos são calculados automaticamente a partir dos lançamentos com categoria "Dívidas". 
          Na descrição do lançamento, inclua o nome da dívida para que o sistema identifique corretamente.
        </p>
      </div>

      {/* Lista de Dívidas */}
      {debts.length === 0 ? (
        <div 
          className="text-center py-12 bg-card border border-border rounded-xl opacity-0 animate-scale-in"
          style={{ animationDelay: '0.3s' }}
        >
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma dívida cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Dívida" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {debts.map((debt, index) => (
            <div 
              key={debt.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + index * 0.08}s` }}
            >
              <DebtCard
                debt={debt}
                paidValue={getTotalPaidValue(debt, transactions)}
                onUpdate={(updates) => onUpdateDebt(debt.id, updates)}
                onDelete={() => onDeleteDebt(debt.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

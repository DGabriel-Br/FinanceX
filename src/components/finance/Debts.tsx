import { useState } from 'react';
import { Plus, Trash2, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Debt, DebtPayment } from '@/types/debt';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DebtsProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'paidValue'>) => void;
  onDeleteDebt: (id: string) => void;
  onAddPayment: (payment: Omit<DebtPayment, 'id' | 'createdAt'>) => void;
  getPaymentsForDebt: (debtId: string) => DebtPayment[];
  onDeletePayment: (id: string) => void;
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

// Formulário de Nova Dívida
const DebtForm = ({ onSubmit, onClose }: { onSubmit: (debt: Omit<Debt, 'id' | 'createdAt' | 'paidValue'>) => void; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseCurrency(totalValue);
    if (!name.trim() || numericValue <= 0 || !expectedEndDate) return;

    onSubmit({
      name: name.trim(),
      totalValue: numericValue,
      expectedEndDate,
    });

    setName('');
    setTotalValue('');
    setExpectedEndDate('');
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
        <label className="block text-sm font-medium text-foreground mb-2">Previsão de Término</label>
        <input
          type="month"
          value={expectedEndDate}
          onChange={e => setExpectedEndDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || parseCurrency(totalValue) <= 0 || !expectedEndDate}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Adicionar Dívida
      </button>
    </form>
  );
};

// Formulário de Pagamento
const PaymentForm = ({ debtId, onSubmit, onClose }: { debtId: string; onSubmit: (payment: Omit<DebtPayment, 'id' | 'createdAt'>) => void; onClose: () => void }) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseCurrency(value);
    if (numericValue <= 0 || !date) return;

    onSubmit({
      debtId,
      value: numericValue,
      date,
    });

    setValue('');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Valor do Pagamento (R$)</label>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => setValue(formatCurrencyInput(e.target.value))}
          placeholder="0,00"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Data</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={parseCurrency(value) <= 0 || !date}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-income text-primary-foreground font-medium text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DollarSign className="w-4 h-4" />
        Registrar Pagamento
      </button>
    </form>
  );
};

// Card de Dívida Individual
const DebtCard = ({ 
  debt, 
  payments, 
  onDelete, 
  onAddPayment,
  onDeletePayment 
}: { 
  debt: Debt; 
  payments: DebtPayment[];
  onDelete: () => void;
  onAddPayment: (payment: Omit<DebtPayment, 'id' | 'createdAt'>) => void;
  onDeletePayment: (id: string) => void;
}) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const remaining = debt.totalValue - debt.paidValue;
  const progress = debt.totalValue > 0 ? (debt.paidValue / debt.totalValue) * 100 : 0;

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
              <Calendar className="w-3 h-3" />
              <span>Previsão: {formatMonthYear(debt.expectedEndDate)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-expense hover:bg-expense/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Pago</p>
          <p className="font-semibold text-income text-sm">{formatCurrency(debt.paidValue)}</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Restante</p>
          <p className="font-semibold text-expense text-sm">{formatCurrency(remaining)}</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="font-semibold text-foreground text-sm">{formatCurrency(debt.totalValue)}</p>
        </div>
      </div>

      {/* Botão de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogTrigger asChild>
          <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-primary text-primary font-medium text-sm transition-all duration-200 hover:bg-primary/10">
            <Plus className="w-4 h-4" />
            Registrar Pagamento
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pagamento - {debt.name}</DialogTitle>
          </DialogHeader>
          <PaymentForm 
            debtId={debt.id} 
            onSubmit={onAddPayment} 
            onClose={() => setIsPaymentDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Histórico de Pagamentos */}
      {payments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Últimos pagamentos</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded-lg">
                <span className="text-muted-foreground">
                  {new Date(payment.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-income">{formatCurrency(payment.value)}</span>
                  <button
                    onClick={() => onDeletePayment(payment.id)}
                    className="p-1 text-muted-foreground hover:text-expense transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Debts = ({ 
  debts, 
  onAddDebt, 
  onDeleteDebt, 
  onAddPayment,
  getPaymentsForDebt,
  onDeletePayment
}: DebtsProps) => {
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);

  const stats = {
    totalDebt: debts.reduce((sum, d) => sum + d.totalValue, 0),
    totalPaid: debts.reduce((sum, d) => sum + d.paidValue, 0),
    totalRemaining: debts.reduce((sum, d) => sum + (d.totalValue - d.paidValue), 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dívidas</h2>
          <p className="text-muted-foreground mt-1">Gerencie e acompanhe suas dívidas</p>
        </div>
        
        <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Nova Dívida
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Dívida</DialogTitle>
            </DialogHeader>
            <DebtForm onSubmit={onAddDebt} onClose={() => setIsDebtDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total em Dívidas</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalDebt)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Pago</p>
          <p className="text-xl font-bold text-income">{formatCurrency(stats.totalPaid)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Falta Pagar</p>
          <p className="text-xl font-bold text-expense">{formatCurrency(stats.totalRemaining)}</p>
        </div>
      </div>

      {/* Lista de Dívidas */}
      {debts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma dívida cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Dívida" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              payments={getPaymentsForDebt(debt.id)}
              onDelete={() => onDeleteDebt(debt.id)}
              onAddPayment={onAddPayment}
              onDeletePayment={onDeletePayment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

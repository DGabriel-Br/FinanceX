import { useState } from 'react';
import { Plus, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Debt } from '@/types/debt';
import { Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { DebtForm, DebtCard } from './debt';
import { calculateDebtPaidValue, calculateDebtsSummary } from '@/core/finance';

interface DebtsProps {
  debts: Debt[];
  transactions: Transaction[];
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onUpdateDebt: (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void;
  onDeleteDebt: (id: string) => void;
  formatValue?: (value: number) => string;
  showValues?: boolean;
  onToggleValues?: () => void;
}

export const Debts = ({
  debts, 
  transactions,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  formatValue,
  showValues,
  onToggleValues,
}: DebtsProps) => {
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  
  // Helper para formatar valores usando o prop ou fallback
  const displayValue = (value: number) => formatValue ? formatValue(value) : formatCurrency(value);

  // Calcula estatísticas gerais usando função do core
  const stats = calculateDebtsSummary(debts, transactions);

  const handleAddDebt = (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    onAddDebt(debt);
    setIsDebtDialogOpen(false);
  };

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
        
        {/* Botões visíveis apenas em desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {onToggleValues && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleValues}
              title={showValues ? 'Ocultar valores' : 'Exibir valores'}
              className="h-10 w-10 shrink-0"
            >
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          )}
          
          <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Nova Dívida
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Dívida</DialogTitle>
              </DialogHeader>
              <DebtForm onSubmit={handleAddDebt} onClose={() => setIsDebtDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Total em Dívidas</p>
          <p className="text-lg md:text-xl font-bold text-foreground">{displayValue(stats.totalDebt)}</p>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Total Pago</p>
          <p className="text-lg md:text-xl font-bold text-income">{displayValue(stats.totalPaid)}</p>
        </div>
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <p className="text-xs md:text-sm text-muted-foreground">Falta Pagar</p>
          <p className="text-lg md:text-xl font-bold text-expense">{displayValue(stats.totalRemaining)}</p>
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

      {/* Botão Nova Dívida - visível apenas em mobile, abaixo da dica */}
      <div className="sm:hidden mb-6">
        <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Nova Dívida
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Dívida</DialogTitle>
            </DialogHeader>
            <DebtForm onSubmit={handleAddDebt} onClose={() => setIsDebtDialogOpen(false)} />
          </DialogContent>
        </Dialog>
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
                paidValue={calculateDebtPaidValue(debt, transactions)}
                onUpdate={(updates) => onUpdateDebt(debt.id, updates)}
                onDelete={() => onDeleteDebt(debt.id)}
                displayValue={displayValue}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

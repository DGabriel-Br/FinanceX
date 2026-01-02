import { CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Debt, calculateExpectedEndDate, calculateProgress } from '@/types/debt';
import { Transaction } from '@/types/transaction';
import { Progress } from '@/components/ui/progress';

interface DebtTrackerProps {
  debts: Debt[];
  transactions: Transaction[];
  onNavigateToDebts?: () => void;
  formatValue?: (value: number) => string;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata data YYYY-MM para exibição
const formatMonthYear = (date: string): string => {
  const [year, month] = date.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year}`;
};

// Calcula valor total pago de uma dívida (valor cadastrado + transações relacionadas)
const getTotalPaidValue = (debt: Debt, transactions: Transaction[]): number => {
  const transactionsPaid = transactions
    .filter(t => t.type === 'despesa' && t.category === 'dividas' && 
            t.description.toLowerCase().includes(debt.name.toLowerCase()))
    .reduce((sum, t) => sum + t.value, 0);
  
  return (debt.paidValue || 0) + transactionsPaid;
};

export const DebtTracker = ({ debts, transactions, onNavigateToDebts, formatValue }: DebtTrackerProps) => {
  // Helper para formatar valores
  const displayValue = (value: number) => formatValue ? formatValue(value) : formatCurrency(value);
  // Filtra apenas dívidas não quitadas para verificar se deve mostrar o componente
  const hasActiveDebts = debts.some(debt => {
    const paidValue = getTotalPaidValue(debt, transactions);
    return calculateProgress(debt.totalValue, paidValue) < 100;
  });

  if (debts.length === 0 || !hasActiveDebts) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Acompanhamento de Dívidas
          </h3>
        </div>
        <div className="text-center py-8">
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma dívida cadastrada</p>
          {onNavigateToDebts && (
            <button 
              onClick={onNavigateToDebts}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Cadastrar dívida
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filtra apenas dívidas não quitadas (progresso < 100%)
  const activeDebts = debts.filter(debt => {
    const paidValue = getTotalPaidValue(debt, transactions);
    return calculateProgress(debt.totalValue, paidValue) < 100;
  });

  // Calcula totais apenas das dívidas ativas
  const totals = activeDebts.reduce((acc, debt) => {
    const paidValue = getTotalPaidValue(debt, transactions);
    return {
      totalDebt: acc.totalDebt + debt.totalValue,
      totalPaid: acc.totalPaid + paidValue,
    };
  }, { totalDebt: 0, totalPaid: 0 });

  const overallProgress = calculateProgress(totals.totalDebt, totals.totalPaid);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Acompanhamento de Dívidas
          </h3>
          <p className="text-xs text-muted-foreground mt-1 ml-7">Pagamentos registrados automaticamente a partir dos lançamentos.</p>
        </div>
        {onNavigateToDebts && (
          <button 
            onClick={onNavigateToDebts}
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </button>
        )}
      </div>

      {/* Progresso Geral */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-income" />
            Progresso Geral
          </span>
          <span className="text-sm font-bold text-primary">{overallProgress.toFixed(1)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2 mb-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pago: <span className="text-income font-medium">{displayValue(totals.totalPaid)}</span></span>
          <span>Total: <span className="text-foreground font-medium">{displayValue(totals.totalDebt)}</span></span>
        </div>
      </div>

      {/* Lista de Dívidas Ativas */}
      <div className="space-y-4">
      {activeDebts.slice(0, 3).map(debt => {
          const paidValue = getTotalPaidValue(debt, transactions);
          const remaining = debt.totalValue - paidValue;
          const progress = calculateProgress(debt.totalValue, paidValue);
          const expectedEndDate = calculateExpectedEndDate(debt.totalValue, debt.monthlyInstallment, debt.startDate, paidValue);

          return (
            <div key={debt.id} className="border border-border rounded-lg p-4">
              {/* Nome e Previsão */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">
                  {debt.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Acaba em: {formatMonthYear(expectedEndDate)}</span>
                </div>
              </div>

              {/* Percentual e Barra */}
              <div className="mb-3">
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold text-foreground">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Valores */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Pago</p>
                  <p className="font-semibold text-income">{displayValue(paidValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Falta</p>
                  <p className="font-semibold text-expense">{displayValue(Math.max(0, remaining))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">{displayValue(debt.totalValue)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeDebts.length > 3 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          +{activeDebts.length - 3} dívida(s) não exibida(s)
        </p>
      )}

      {activeDebts.length === 0 && debts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-income font-medium text-sm">🎉 Todas as dívidas foram quitadas!</p>
        </div>
      )}
    </div>
  );
};

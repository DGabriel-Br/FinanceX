import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  TransactionCategory,
  IncomeCategory,
  ExpenseCategory,
  incomeCategoryLabels,
  expenseCategoryLabels,
  getCategoryLabel,
  getCategoryIcon
} from '@/types/transaction';
import { parseLocalDate } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formatar data para exibição (dd/MM/yyyy)
const formatDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const incomeCategories: IncomeCategory[] = ['salario', '13_salario', 'ferias', 'freelance', 'outros_receita'];
const expenseCategories: ExpenseCategory[] = ['contas_fixas', 'investimentos', 'dividas', 'educacao', 'transporte', 'mercado', 'delivery', 'outros_despesa'];

export const TransactionList = ({ transactions, onUpdate, onDelete }: TransactionListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    type: 'despesa' as TransactionType,
    category: 'contas_fixas' as TransactionCategory,
    date: '',
    description: '',
    value: '',
  });

  // Atualizar categoria quando tipo mudar na edição
  useEffect(() => {
    if (editingId) {
      if (editForm.type === 'receita' && !incomeCategories.includes(editForm.category as IncomeCategory)) {
        setEditForm(prev => ({ ...prev, category: 'salario' }));
      } else if (editForm.type === 'despesa' && !expenseCategories.includes(editForm.category as ExpenseCategory)) {
        setEditForm(prev => ({ ...prev, category: 'contas_fixas' }));
      }
    }
  }, [editForm.type, editingId, editForm.category]);

  const startEditing = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      type: transaction.type,
      category: transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa'),
      date: transaction.date,
      description: transaction.description,
      value: transaction.value.toString(),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ type: 'despesa', category: 'contas_fixas', date: '', description: '', value: '' });
  };

  const saveEditing = (id: string) => {
    if (!editForm.description.trim() || !editForm.value || parseFloat(editForm.value) <= 0) {
      return;
    }

    onUpdate(id, {
      type: editForm.type,
      category: editForm.category,
      date: editForm.date,
      description: editForm.description.trim(),
      value: parseFloat(editForm.value),
    });

    setEditingId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum lançamento encontrado.</p>
        <p className="text-sm mt-1">Adicione seu primeiro lançamento ao lado.</p>
      </div>
    );
  }

  const currentEditCategories = editForm.type === 'receita' ? incomeCategories : expenseCategories;
  const editCategoryLabels = editForm.type === 'receita' ? incomeCategoryLabels : expenseCategoryLabels;

  return (
    <div className="space-y-3">
      {transactions.map(transaction => {
        const categoryKey = transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa');
        const Icon = getCategoryIcon(categoryKey, transaction.type);

        return (
          <div
            key={transaction.id}
            className="group bg-card border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors duration-150"
          >
            {editingId === transaction.id ? (
              // Modo edição
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Data</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                    <select
                      value={editForm.type}
                      onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    {currentEditCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {editCategoryLabels[cat as keyof typeof editCategoryLabels]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editForm.value}
                    onChange={e => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => saveEditing(transaction.id)}
                    className="px-4 py-2 rounded-lg bg-income text-white hover:bg-income/90 transition-colors text-sm font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualização
              <div className="flex items-center gap-4">
                {/* Ícone da categoria */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  transaction.type === 'receita' 
                    ? 'bg-income/10 text-income' 
                    : 'bg-expense/10 text-expense'
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {transaction.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      transaction.type === 'receita' 
                        ? 'bg-income/10 text-income' 
                        : 'bg-expense/10 text-expense'
                    )}>
                      {getCategoryLabel(categoryKey, transaction.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>

                {/* Valor */}
                <div className="text-right flex-shrink-0">
                  <span
                    className={cn(
                      'font-semibold',
                      transaction.type === 'receita' ? 'text-income' : 'text-expense'
                    )}
                  >
                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value)}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <button
                    onClick={() => startEditing(transaction)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-expense hover:bg-expense/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

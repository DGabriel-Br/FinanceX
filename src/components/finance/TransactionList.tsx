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
  getCategoryLabel
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

// Formatar data para exibição
const formatDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
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
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Data
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categoria
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Descrição
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Valor
            </th>
            <th className="w-24 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map(transaction => (
            <tr
              key={transaction.id}
              className="group bg-card hover:bg-muted/30 transition-colors duration-150"
            >
              {editingId === transaction.id ? (
                // Modo edição
                <>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-2 py-1 rounded border border-input bg-background text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <select
                        value={editForm.type}
                        onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                        className="px-2 py-1 rounded border border-input bg-background text-sm"
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                        className="px-2 py-1 rounded border border-input bg-background text-sm"
                      >
                        {currentEditCategories.map(cat => (
                          <option key={cat} value={cat}>
                            {editCategoryLabels[cat as keyof typeof editCategoryLabels]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2 py-1 rounded border border-input bg-background text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editForm.value}
                      onChange={e => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-2 py-1 rounded border border-input bg-background text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => saveEditing(transaction.id)}
                        className="p-2 rounded-lg text-income hover:bg-income/10 transition-colors"
                        title="Salvar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // Modo visualização
                <>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      transaction.type === 'receita' 
                        ? 'bg-income/10 text-income' 
                        : 'bg-expense/10 text-expense'
                    )}>
                      {getCategoryLabel(transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa'), transaction.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{transaction.description}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        transaction.type === 'receita' ? 'text-income' : 'text-expense'
                      )}
                    >
                      {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

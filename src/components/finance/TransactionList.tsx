import { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Check, X, ChevronRight } from 'lucide-react';
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
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  formatValue?: (value: number) => string;
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

// Formatar data para header do grupo (estilo extrato)
const formatDateHeader = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  
  if (isToday(date)) {
    return `Hoje, ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  }
  
  if (isYesterday(date)) {
    return `Ontem, ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  }
  
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const incomeCategories: IncomeCategory[] = ['salario', '13_salario', 'ferias', 'freelance', 'outros_receita'];
const expenseCategories: ExpenseCategory[] = ['contas_fixas', 'investimentos', 'dividas', 'educacao', 'transporte', 'mercado', 'delivery', 'outros_despesa'];

// Componente para item de transação mobile
const MobileTransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  formatValue,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onCancel,
  currentEditCategories,
  editCategoryLabels
}: { 
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  formatValue?: (value: number) => string;
  isEditing: boolean;
  editForm: {
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    description: string;
    value: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    description: string;
    value: string;
  }>>;
  onSave: () => void;
  onCancel: () => void;
  currentEditCategories: TransactionCategory[];
  editCategoryLabels: Record<string, string>;
}) => {
  const categoryKey = transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa');
  const Icon = getCategoryIcon(categoryKey, transaction.type);
  const categoryLabel = getCategoryLabel(categoryKey, transaction.type);
  const displayValue = formatValue ? formatValue(transaction.value) : formatCurrency(transaction.value);

  if (isEditing) {
    return (
      <div className="p-4 bg-card border border-primary/50 rounded-xl space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data</label>
            <input
              type="date"
              value={editForm.date}
              onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
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
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Salvar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0 group">
      {/* Ícone */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        transaction.type === 'receita' ? 'bg-income/10' : 'bg-muted'
      )}>
        <Icon className={cn(
          "w-5 h-5",
          transaction.type === 'receita' ? 'text-income' : 'text-muted-foreground'
        )} />
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{categoryLabel}</p>
        <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
        <p className={cn(
          "text-sm font-semibold",
          transaction.type === 'receita' ? 'text-income' : 'text-expense'
        )}>
          {transaction.type === 'despesa' ? '- ' : '+ '}{displayValue}
        </p>
      </div>
      
      {/* Ações */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-expense hover:bg-expense/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
    </div>
  );
};

export const TransactionList = ({ transactions, onUpdate, onDelete, formatValue }: TransactionListProps) => {
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

  // Agrupar transações por data para o mobile
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      const dateKey = transaction.date;
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(transaction);
    });
    
    // Ordenar por data decrescente
    return Array.from(groups.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
  }, [transactions]);

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
    <>
      {/* Desktop - Tabela */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
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
                      {(() => {
                        const categoryKey = transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa');
                        const Icon = getCategoryIcon(categoryKey, transaction.type);
                        return (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
                            transaction.type === 'receita' 
                              ? 'bg-income/10 text-income' 
                              : 'bg-expense/10 text-expense'
                          )}>
                            <Icon className="w-3 h-3" />
                            {getCategoryLabel(categoryKey, transaction.type)}
                          </span>
                        );
                      })()}
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
                        {transaction.type === 'receita' ? '+' : '-'} {formatValue ? formatValue(transaction.value) : formatCurrency(transaction.value)}
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

      {/* Mobile - Lista estilo extrato bancário */}
      <div className="md:hidden space-y-4">
        {groupedTransactions.map(([date, dateTransactions]) => (
          <div key={date}>
            {/* Header da data */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 border-b border-border mb-2">
              <h3 className="text-sm font-semibold text-foreground capitalize">
                {formatDateHeader(date)}
              </h3>
            </div>
            
            {/* Lista de transações do dia */}
            <div className="bg-card rounded-xl border border-border px-4">
              {dateTransactions.map(transaction => (
                <MobileTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => startEditing(transaction)}
                  onDelete={() => onDelete(transaction.id)}
                  formatValue={formatValue}
                  isEditing={editingId === transaction.id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={() => saveEditing(transaction.id)}
                  onCancel={cancelEditing}
                  currentEditCategories={currentEditCategories}
                  editCategoryLabels={editCategoryLabels}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
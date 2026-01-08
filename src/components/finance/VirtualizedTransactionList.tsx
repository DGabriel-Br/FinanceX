import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { VariableSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
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
import { formatCurrency } from '@/lib/currency';
import { getCleanDescription } from '@/core/finance/investmentMetadata';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface VirtualizedTransactionListProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  formatValue?: (value: number) => string;
  height?: number;
}

const incomeCategories: IncomeCategory[] = ['salario', '13_salario', 'ferias', 'freelance', 'outros_receita'];
const expenseCategories: ExpenseCategory[] = ['contas_fixas', 'investimentos', 'dividas', 'educacao', 'transporte', 'mercado', 'delivery', 'outros_despesa'];

// Item type for flat list
type ListItem = 
  | { type: 'header'; date: string; key: string }
  | { type: 'transaction'; transaction: Transaction; key: string };

// Memoized transaction item
const TransactionItem = memo(({ 
  transaction, 
  onEdit, 
  onDelete, 
  formatValue,
}: { 
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  formatValue?: (value: number) => string;
}) => {
  const categoryKey = transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa');
  const Icon = getCategoryIcon(categoryKey, transaction.type);
  const categoryLabel = getCategoryLabel(categoryKey, transaction.type);
  const displayValue = formatValue ? formatValue(transaction.value) : formatCurrency(transaction.value);

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-b-0 group hover:bg-muted/30 transition-colors">
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        transaction.type === 'receita' ? 'bg-income/10' : 'bg-muted'
      )}>
        <Icon className={cn(
          "w-5 h-5",
          transaction.type === 'receita' ? 'text-income' : 'text-muted-foreground'
        )} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{categoryLabel}</p>
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {transaction.category === 'investimentos' 
            ? getCleanDescription(transaction.description) 
            : transaction.description}
        </p>
        <p className={cn(
          "text-sm font-semibold",
          transaction.type === 'receita' ? 'text-income' : 'text-expense'
        )}>
          {transaction.type === 'despesa' ? '- ' : '+ '}{displayValue}
        </p>
      </div>
      
      {/* Actions - sempre visíveis no mobile */}
      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-expense hover:bg-expense/10 transition-colors touch-target"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

// Date header component
const DateHeader = memo(({ date }: { date: string }) => {
  const formatDateHeader = (dateString: string): string => {
    const d = parseLocalDate(dateString);
    if (isToday(d)) {
      return `Hoje, ${format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    if (isYesterday(d)) {
      return `Ontem, ${format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 px-4 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground capitalize">
        {formatDateHeader(date)}
      </h3>
    </div>
  );
});

DateHeader.displayName = 'DateHeader';

export const VirtualizedTransactionList = ({ 
  transactions, 
  onUpdate, 
  onDelete, 
  formatValue,
  height = 600,
}: VirtualizedTransactionListProps) => {
  const isMobile = useIsMobile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null,
  });
  const [editForm, setEditForm] = useState({
    type: 'despesa' as TransactionType,
    category: 'contas_fixas' as TransactionCategory,
    date: '',
    description: '',
    value: '',
  });

  // Flatten transactions with date headers for virtualization
  const flatList = useMemo<ListItem[]>(() => {
    const groups = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      const dateKey = transaction.date;
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(transaction);
    });
    
    // Sort transactions within each group
    groups.forEach((groupTransactions) => {
      groupTransactions.sort((a, b) => b.createdAt - a.createdAt);
    });
    
    // Sort groups by date descending
    const sortedDates = Array.from(groups.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

    // Flatten into list with headers
    const items: ListItem[] = [];
    for (const [date, dateTransactions] of sortedDates) {
      items.push({ type: 'header', date, key: `header-${date}` });
      for (const transaction of dateTransactions) {
        items.push({ type: 'transaction', transaction, key: transaction.id });
      }
    }
    return items;
  }, [transactions]);

  const handleDeleteClick = useCallback((transaction: Transaction) => {
    setDeleteConfirm({ open: true, transaction });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm.transaction) {
      onDelete(deleteConfirm.transaction.id);
    }
    setDeleteConfirm({ open: false, transaction: null });
  }, [deleteConfirm.transaction, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ open: false, transaction: null });
  }, []);

  const startEditing = useCallback((transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      type: transaction.type,
      category: transaction.category || (transaction.type === 'receita' ? 'outros_receita' : 'outros_despesa'),
      date: transaction.date,
      description: transaction.description,
      value: transaction.value.toString(),
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditForm({ type: 'despesa', category: 'contas_fixas', date: '', description: '', value: '' });
  }, []);

  const saveEditing = useCallback((id: string) => {
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
  }, [editForm, onUpdate]);

  // Row renderer for react-window
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = flatList[index];
    
    if (item.type === 'header') {
      return (
        <div style={style}>
          <DateHeader date={item.date} />
        </div>
      );
    }
    
    const transaction = item.transaction;
    const isEditing = editingId === transaction.id;
    
    if (isEditing) {
      // Editing mode - inline form
      const currentEditCategories = editForm.type === 'receita' ? incomeCategories : expenseCategories;
      const editCategoryLabels = editForm.type === 'receita' ? incomeCategoryLabels : expenseCategoryLabels;

      return (
        <div style={style} className="p-4 bg-card border border-primary/50">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={editForm.type}
              onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value as TransactionType }))}
              className="px-2 py-1 rounded border border-input bg-background text-sm"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <input
              type="date"
              value={editForm.date}
              onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              className="px-2 py-1 rounded border border-input bg-background text-sm"
            />
          </div>
          <select
            value={editForm.category}
            onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
            className="w-full px-2 py-1 mb-2 rounded border border-input bg-background text-sm"
          >
            {currentEditCategories.map(cat => (
              <option key={cat} value={cat}>
                {editCategoryLabels[cat as keyof typeof editCategoryLabels]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editForm.description}
            onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 h-11 text-base lg:h-10 lg:text-sm mb-2 rounded-lg border border-input bg-background"
            placeholder="Descrição"
          />
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={editForm.value}
              onChange={e => setEditForm(prev => ({ ...prev, value: e.target.value }))}
              className="flex-1 px-3 h-11 text-base lg:h-10 lg:text-sm rounded-lg border border-input bg-background"
              placeholder="Valor"
            />
            <button
              onClick={() => saveEditing(transaction.id)}
              className="h-11 lg:h-10 px-4 rounded-lg bg-primary text-primary-foreground touch-target flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEditing}
              className="h-11 lg:h-10 px-4 rounded-lg border border-border touch-target flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div style={style}>
        <TransactionItem
          transaction={transaction}
          onEdit={() => startEditing(transaction)}
          onDelete={() => handleDeleteClick(transaction)}
          formatValue={formatValue}
        />
      </div>
    );
  }, [flatList, editingId, editForm, formatValue, handleDeleteClick, startEditing, saveEditing, cancelEditing]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum lançamento encontrado.</p>
        <p className="text-sm mt-1">Adicione seu primeiro lançamento ao lado.</p>
      </div>
    );
  }

  // Calculate dynamic height based on viewport
  const listHeight = isMobile ? Math.min(height, window.innerHeight - 300) : height;
  const itemSize = isMobile ? 85 : 72; // Taller items on mobile
  const headerSize = 40;
  const editingItemSize = 200; // Taller when editing

  const listRef = useRef<VariableSizeList>(null);

  // Reset row heights when editing changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [editingId]);

  const getItemSize = useCallback((index: number) => {
    const item = flatList[index];
    if (item.type === 'header') return headerSize;
    if (item.type === 'transaction' && editingId === item.transaction.id) return editingItemSize;
    return itemSize;
  }, [flatList, editingId, headerSize, itemSize]);

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <VariableSizeList
          ref={listRef}
          height={listHeight}
          itemCount={flatList.length}
          itemSize={getItemSize}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </VariableSizeList>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.transaction && (
                <>
                  Tem certeza que deseja excluir "{deleteConfirm.transaction.description}" 
                  no valor de {formatValue ? formatValue(deleteConfirm.transaction.value) : formatCurrency(deleteConfirm.transaction.value)}?
                  <br /><br />
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-expense hover:bg-expense/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

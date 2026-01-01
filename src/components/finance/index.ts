// Shim de compatibilidade para src/components/finance
// Reexporta todos os componentes do local original para permitir
// importações tanto de @/components/finance quanto de @/features/finance/components

export { CategoryCharts } from './CategoryCharts';
export { CategoryManager } from './CategoryManager';
export { Dashboard } from './Dashboard';
export { DebtTracker } from './DebtTracker';
export { Debts } from './Debts';
export { ExcelImportExport } from './ExcelImportExport';
export { FloatingAddButton } from './FloatingAddButton';
export { Investments } from './Investments';
export { MobileHeader } from './MobileHeader';
export { MobileNav } from './MobileNav';
export type { MobileNavProps } from './MobileNav';
export { OfflineModal } from './OfflineModal';
export { OfflineStatusBar } from './OfflineStatusBar';
export { PeriodFilter } from './PeriodFilter';
export type { CustomDateRange } from './PeriodFilter';
export { PullToRefresh } from './PullToRefresh';
export { Sidebar } from './Sidebar';
export type { SidebarProps } from './Sidebar';
export { SyncIndicator, SyncBadge } from './SyncIndicator';
export { TransactionForm } from './TransactionForm';
export { TransactionList } from './TransactionList';
export { Transactions } from './Transactions';
export { VirtualizedTransactionList } from './VirtualizedTransactionList';

// Debt subcomponents
export { DebtForm, DebtCard } from './debt';

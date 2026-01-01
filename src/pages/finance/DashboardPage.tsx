import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/features/finance/components';
import { useFinanceData } from '@/features/finance/state';

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    transactions,
    getFilteredTransactions,
    getTotals,
    customRange,
    setCustomRange,
    debts,
    showValues,
    toggleValuesVisibility,
    formatValue,
  } = useFinanceData();

  return (
    <Dashboard
      totals={getTotals()}
      customRange={customRange}
      onCustomRangeChange={setCustomRange}
      transactions={getFilteredTransactions()}
      allTransactions={transactions}
      debts={debts}
      onNavigateToDebts={() => navigate('/dividas')}
      showValues={showValues}
      onToggleValues={toggleValuesVisibility}
      formatValue={formatValue}
    />
  );
};

export default DashboardPage;

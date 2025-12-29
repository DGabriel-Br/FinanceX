import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/finance/Dashboard';
import { useFinanceData } from '@/contexts/FinanceDataContext';

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

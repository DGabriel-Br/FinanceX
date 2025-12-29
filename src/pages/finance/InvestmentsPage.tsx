import { useNavigate } from 'react-router-dom';
import { Investments } from '@/components/finance/Investments';
import { useFinanceData } from '@/contexts/FinanceDataContext';

const InvestmentsPage = () => {
  const navigate = useNavigate();
  const {
    transactions,
    getFilteredTransactions,
    customRange,
    setCustomRange,
    addTransaction,
    formatValue,
    showValues,
    toggleValuesVisibility,
  } = useFinanceData();

  return (
    <Investments
      transactions={getFilteredTransactions()}
      allTransactions={transactions}
      customRange={customRange}
      onCustomRangeChange={setCustomRange}
      onNavigateToTransactions={() => navigate('/lancamentos')}
      onAddTransaction={addTransaction}
      formatValue={formatValue}
      showValues={showValues}
      onToggleValues={toggleValuesVisibility}
    />
  );
};

export default InvestmentsPage;

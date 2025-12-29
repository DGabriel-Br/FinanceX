import { Debts } from '@/components/finance/Debts';
import { useFinanceData } from '@/contexts/FinanceDataContext';

const DebtsPage = () => {
  const {
    debts,
    transactions,
    addDebt,
    updateDebt,
    deleteDebt,
    formatValue,
    showValues,
    toggleValuesVisibility,
  } = useFinanceData();

  return (
    <Debts
      debts={debts}
      transactions={transactions}
      onAddDebt={addDebt}
      onUpdateDebt={updateDebt}
      onDeleteDebt={deleteDebt}
      formatValue={formatValue}
      showValues={showValues}
      onToggleValues={toggleValuesVisibility}
    />
  );
};

export default DebtsPage;

import { Debts } from '@/features/finance/components';
import { useFinanceData } from '@/features/finance/state';

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

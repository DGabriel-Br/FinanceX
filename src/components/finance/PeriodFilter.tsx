import { PeriodFilter as PeriodFilterType } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
}

const periods: { value: PeriodFilterType; label: string }[] = [
  { value: 'dia', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'todos', label: 'Todos' },
];

export const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            value === period.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

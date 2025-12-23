import { useState } from 'react';
import { PeriodFilter as PeriodFilterType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CustomDateRange {
  start: Date;
  end: Date;
}

interface AdvancedPeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
}

const periods: { value: PeriodFilterType; label: string }[] = [
  { value: 'dia', label: 'Dia' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'todos', label: 'Todos' },
];

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const AdvancedPeriodFilter = ({ 
  value, 
  onChange, 
  customRange, 
  onCustomRangeChange 
}: AdvancedPeriodFilterProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(customRange?.start || new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handlePeriodChange = (newPeriod: PeriodFilterType) => {
    onChange(newPeriod);
    updateCustomRange(selectedDate, newPeriod);
  };

  const updateCustomRange = (date: Date, period: PeriodFilterType) => {
    let range: CustomDateRange | null = null;

    switch (period) {
      case 'dia':
        range = { start: date, end: date };
        break;
      case 'semana':
        range = { 
          start: startOfWeek(date, { weekStartsOn: 0 }), 
          end: endOfWeek(date, { weekStartsOn: 0 }) 
        };
        break;
      case 'mes':
        range = { 
          start: startOfMonth(date), 
          end: endOfMonth(date) 
        };
        break;
      case 'ano':
        range = { 
          start: startOfYear(date), 
          end: endOfYear(date) 
        };
        break;
      case 'todos':
        range = null;
        break;
    }

    onCustomRangeChange(range);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateCustomRange(date, value);
      setCalendarOpen(false);
    }
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(monthIndex));
    setSelectedDate(newDate);
    updateCustomRange(newDate, value);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year));
    setSelectedDate(newDate);
    updateCustomRange(newDate, value);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const delta = direction === 'prev' ? -1 : 1;

    switch (value) {
      case 'dia':
        newDate.setDate(newDate.getDate() + delta);
        break;
      case 'semana':
        newDate.setDate(newDate.getDate() + (delta * 7));
        break;
      case 'mes':
        newDate.setMonth(newDate.getMonth() + delta);
        break;
      case 'ano':
        newDate.setFullYear(newDate.getFullYear() + delta);
        break;
    }

    setSelectedDate(newDate);
    updateCustomRange(newDate, value);
  };

  const getDisplayLabel = (): string => {
    if (value === 'todos') return 'Todos os períodos';
    
    switch (value) {
      case 'dia':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'semana': {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `${format(start, 'dd/MM', { locale: ptBR })} - ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
      }
      case 'mes':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'ano':
        return format(selectedDate, 'yyyy', { locale: ptBR });
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Period selector buttons */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
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

      {/* Navigation and date selector */}
      {value !== 'todos' && (
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePeriod('prev')}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Date display with selectors */}
          <div className="flex items-center gap-2 flex-1">
            {/* Month selector (visible for month/week/day) */}
            {(value === 'mes' || value === 'semana' || value === 'dia') && (
              <Select
                value={selectedDate.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Year selector */}
            <Select
              value={selectedDate.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Calendar picker (for day/week) */}
            {(value === 'dia' || value === 'semana') && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePeriod('next')}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Display current range */}
      {value !== 'todos' && (
        <p className="text-sm text-muted-foreground text-center">
          {getDisplayLabel()}
        </p>
      )}
    </div>
  );
};

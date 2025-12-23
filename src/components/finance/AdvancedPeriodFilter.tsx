import { useState } from 'react';
import { PeriodFilter as PeriodFilterType } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export interface CustomDateRange {
  start: Date;
  end: Date;
}

type PeriodOption = 'maximo' | 'hoje' | 'ontem' | 'ultimos7dias' | 'essemes' | 'mespassado' | 'personalizado';

interface AdvancedPeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
}

const periodOptions: { value: PeriodOption; label: string }[] = [
  { value: 'maximo', label: 'Máximo' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7dias', label: 'Últimos 7 dias' },
  { value: 'essemes', label: 'Esse mês' },
  { value: 'mespassado', label: 'Mês passado' },
  { value: 'personalizado', label: 'Personalizado' },
];

export const AdvancedPeriodFilter = ({ 
  value, 
  onChange, 
  customRange, 
  onCustomRangeChange 
}: AdvancedPeriodFilterProps) => {
  const [selectedOption, setSelectedOption] = useState<PeriodOption>('essemes');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined
  );

  const handleOptionChange = (option: PeriodOption) => {
    setSelectedOption(option);
    const today = new Date();

    let range: CustomDateRange | null = null;

    switch (option) {
      case 'maximo':
        onChange('todos');
        onCustomRangeChange(null);
        return;
      case 'hoje':
        range = { 
          start: startOfDay(today), 
          end: endOfDay(today) 
        };
        break;
      case 'ontem':
        const yesterday = subDays(today, 1);
        range = { 
          start: startOfDay(yesterday), 
          end: endOfDay(yesterday) 
        };
        break;
      case 'ultimos7dias':
        range = { 
          start: startOfDay(subDays(today, 6)), 
          end: endOfDay(today) 
        };
        break;
      case 'essemes':
        range = { 
          start: startOfMonth(today), 
          end: endOfMonth(today) 
        };
        break;
      case 'mespassado':
        const lastMonth = subMonths(today, 1);
        range = { 
          start: startOfMonth(lastMonth), 
          end: endOfMonth(lastMonth) 
        };
        break;
      case 'personalizado':
        setCalendarOpen(true);
        return;
    }

    if (range) {
      onChange('mes');
      onCustomRangeChange(range);
      setDateRange({ from: range.start, to: range.end });
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const customRange: CustomDateRange = {
        start: startOfDay(range.from),
        end: endOfDay(range.to)
      };
      onChange('mes');
      onCustomRangeChange(customRange);
    }
  };

  const getDisplayLabel = (): string => {
    if (selectedOption === 'maximo' || !customRange) {
      return 'Todos os períodos';
    }
    
    const startFormatted = format(customRange.start, "dd/MM/yyyy", { locale: ptBR });
    const endFormatted = format(customRange.end, "dd/MM/yyyy", { locale: ptBR });
    
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[280px]">
      <label className="text-sm text-muted-foreground flex items-center gap-1">
        Período de Visualização
      </label>
      
      {/* Period selector dropdown */}
      <Select
        value={selectedOption}
        onValueChange={(value) => handleOptionChange(value as PeriodOption)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date range picker */}
      {selectedOption === 'personalizado' && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={1}
              initialFocus
              className="p-3 pointer-events-auto"
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Display current range (for non-custom options) */}
      {selectedOption !== 'personalizado' && selectedOption !== 'maximo' && customRange && (
        <p className="text-sm text-muted-foreground">
          {getDisplayLabel()}
        </p>
      )}
    </div>
  );
};

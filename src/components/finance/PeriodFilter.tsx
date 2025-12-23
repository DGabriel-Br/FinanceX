import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export interface CustomDateRange {
  start: Date;
  end: Date;
}

type PeriodOption = 
  | 'maximo'
  | 'hoje'
  | 'ontem'
  | 'ultimos7dias'
  | 'esteMes'
  | 'mesPassado'
  | 'esteAno'
  | 'personalizado';

interface PeriodFilterProps {
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
}

const periodOptions: { value: PeriodOption; label: string }[] = [
  { value: 'maximo', label: 'Máximo' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7dias', label: 'Últimos 7 dias' },
  { value: 'esteMes', label: 'Este mês' },
  { value: 'mesPassado', label: 'Mês passado' },
  { value: 'esteAno', label: 'Este ano' },
  { value: 'personalizado', label: 'Personalizado' },
];

export const PeriodFilter = ({ 
  customRange, 
  onCustomRangeChange 
}: PeriodFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('esteMes');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);

  const handlePeriodChange = (period: PeriodOption) => {
    setSelectedPeriod(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let range: CustomDateRange | null = null;

    switch (period) {
      case 'maximo':
        range = null;
        break;
      case 'hoje':
        range = { start: today, end: today };
        break;
      case 'ontem': {
        const yesterday = subDays(today, 1);
        range = { start: yesterday, end: yesterday };
        break;
      }
      case 'ultimos7dias': {
        const weekAgo = subDays(today, 6);
        range = { start: weekAgo, end: today };
        break;
      }
      case 'esteMes':
        range = { start: startOfMonth(today), end: endOfMonth(today) };
        break;
      case 'mesPassado': {
        const lastMonth = subMonths(today, 1);
        range = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
        break;
      }
      case 'esteAno':
        range = { start: startOfYear(today), end: endOfYear(today) };
        break;
      case 'personalizado':
        // Mantém o range atual ou inicia com o mês atual
        if (!customRange) {
          range = { start: startOfMonth(today), end: today };
        } else {
          range = customRange;
        }
        setTempDateRange({ from: range.start, to: range.end });
        break;
    }

    onCustomRangeChange(range);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setTempDateRange(range);
    if (range?.from && range?.to) {
      onCustomRangeChange({ start: range.from, end: range.to });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!customRange) return;
    
    const delta = direction === 'prev' ? -1 : 1;
    const newStart = new Date(customRange.start);
    const newEnd = new Date(customRange.end);
    
    newStart.setMonth(newStart.getMonth() + delta);
    newEnd.setMonth(newEnd.getMonth() + delta);
    
    onCustomRangeChange({ start: newStart, end: newEnd });
    
    if (selectedPeriod === 'personalizado') {
      setTempDateRange({ from: newStart, to: newEnd });
    }
  };

  const displayLabel = useMemo(() => {
    if (selectedPeriod === 'maximo') return 'Todos os períodos';
    if (!customRange) return 'Selecione um período';

    const isSameDay = customRange.start.toDateString() === customRange.end.toDateString();
    
    if (isSameDay) {
      return format(customRange.start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    
    const sameMonth = customRange.start.getMonth() === customRange.end.getMonth() && 
                      customRange.start.getFullYear() === customRange.end.getFullYear();
    
    if (sameMonth) {
      return `${format(customRange.start, 'dd', { locale: ptBR })} - ${format(customRange.end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    
    return `${format(customRange.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(customRange.end, 'dd/MM/yyyy', { locale: ptBR })}`;
  }, [customRange, selectedPeriod]);

  // Initialize with "esteMes" on mount
  useState(() => {
    const today = new Date();
    onCustomRangeChange({ start: startOfMonth(today), end: endOfMonth(today) });
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="h-9 w-9 shrink-0"
          disabled={selectedPeriod === 'maximo'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Period selector dropdown */}
        <Select value={selectedPeriod} onValueChange={(value) => handlePeriodChange(value as PeriodOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Calendar picker for custom range */}
        {selectedPeriod === 'personalizado' && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={tempDateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={1}
                locale={ptBR}
                className="p-3 pointer-events-auto"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Navigation next */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="h-9 w-9 shrink-0"
          disabled={selectedPeriod === 'maximo'}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Display current range */}
      <p className="text-sm text-muted-foreground text-right">
        {displayLabel}
      </p>
    </div>
  );
};

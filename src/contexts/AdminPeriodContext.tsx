import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface AdminDateRange {
  start: Date;
  end: Date;
}

interface AdminPeriodContextType {
  dateRange: AdminDateRange | null;
  setDateRange: (range: AdminDateRange | null) => void;
  startDateStr: string | null;
  endDateStr: string | null;
  startTimestamp: Date | null;
  endTimestamp: Date | null;
}

const AdminPeriodContext = createContext<AdminPeriodContextType | undefined>(undefined);

export const useAdminPeriod = () => {
  const context = useContext(AdminPeriodContext);
  if (!context) {
    throw new Error('useAdminPeriod must be used within AdminPeriodProvider');
  }
  return context;
};

interface AdminPeriodProviderProps {
  children: ReactNode;
}

export const AdminPeriodProvider = ({ children }: AdminPeriodProviderProps) => {
  const [dateRange, setDateRange] = useState<AdminDateRange | null>(() => {
    const today = new Date();
    return { start: startOfMonth(today), end: endOfMonth(today) };
  });

  const startDateStr = useMemo(() => {
    if (!dateRange) return null;
    return format(dateRange.start, 'yyyy-MM-dd');
  }, [dateRange]);

  const endDateStr = useMemo(() => {
    if (!dateRange) return null;
    return format(dateRange.end, 'yyyy-MM-dd');
  }, [dateRange]);

  const startTimestamp = useMemo(() => {
    if (!dateRange) return null;
    const date = new Date(dateRange.start);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [dateRange]);

  const endTimestamp = useMemo(() => {
    if (!dateRange) return null;
    const date = new Date(dateRange.end);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [dateRange]);

  return (
    <AdminPeriodContext.Provider value={{ 
      dateRange, 
      setDateRange, 
      startDateStr, 
      endDateStr,
      startTimestamp,
      endTimestamp
    }}>
      {children}
    </AdminPeriodContext.Provider>
  );
};

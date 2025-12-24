import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface ValuesVisibilityContextType {
  showValues: boolean;
  toggleValuesVisibility: () => void;
  formatValue: (value: number) => string;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Hook para uso direto
export const useValuesVisibility = () => {
  const [showValues, setShowValues] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showValues');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('showValues', String(showValues));
  }, [showValues]);

  const toggleValuesVisibility = useCallback(() => {
    setShowValues((prev) => !prev);
  }, []);

  const formatValue = useCallback((value: number): string => {
    if (!showValues) {
      return '••••••';
    }
    return formatCurrency(value);
  }, [showValues]);

  return { showValues, toggleValuesVisibility, formatValue };
};

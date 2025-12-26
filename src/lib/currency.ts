/**
 * Utilitários para formatação de moeda brasileira (BRL)
 */

/**
 * Formata um número para o padrão de moeda brasileira (R$ 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata input de moeda brasileira (1.234,56)
 * Remove caracteres não numéricos e formata como moeda
 */
export const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Converte string formatada em BRL para número
 * Ex: "1.234,56" -> 1234.56
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

/**
 * Formata número para string de moeda sem símbolo (1.234,56)
 */
export const formatNumberToCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Utilitários para codificar/decodificar metadados de investimento na descrição.
 * 
 * Formato: "[INV:tipo] Descrição do usuário"
 * Exemplo: "[INV:reserva_emergencia] Aporte mensal"
 * 
 * Para resgates: "[RES:tipo] Descrição do usuário"
 * Exemplo: "[RES:acoes] Venda de PETR4"
 * 
 * Este sistema permite identificação precisa sem depender de parsing frágil,
 * mantendo compatibilidade com descrições antigas.
 */

import { 
  InvestmentType, 
  investmentTypeLabels,
  VALID_INVESTMENT_TYPES,
  extractInvestmentType,
} from '@/types/investment';

// Regex para extrair metadados estruturados
const INVESTMENT_TAG_REGEX = /^\[INV:([a-z_]+)\]\s*/i;
const WITHDRAWAL_TAG_REGEX = /^\[RES:([a-z_]+)\]\s*/i;

/**
 * Resultado da extração de metadados
 */
export interface InvestmentMetadata {
  type: InvestmentType;
  isWithdrawal: boolean;
  userDescription: string;
  hasStructuredTag: boolean;
}

/**
 * Codifica metadados de investimento na descrição
 */
export const encodeInvestmentDescription = (
  investmentType: InvestmentType,
  userDescription: string,
  isWithdrawal: boolean = false
): string => {
  const prefix = isWithdrawal ? 'RES' : 'INV';
  const cleanDescription = userDescription.trim();
  
  // Se a descrição já tem uma tag, remove antes de adicionar nova
  const descWithoutTag = cleanDescription
    .replace(INVESTMENT_TAG_REGEX, '')
    .replace(WITHDRAWAL_TAG_REGEX, '')
    .trim();
  
  return `[${prefix}:${investmentType}] ${descWithoutTag || investmentTypeLabels[investmentType]}`;
};

/**
 * Decodifica metadados de investimento da descrição
 * Suporta tanto o novo formato estruturado quanto o parsing legado
 */
export const decodeInvestmentDescription = (description: string): InvestmentMetadata => {
  // Tenta primeiro o formato estruturado de investimento
  const investmentMatch = description.match(INVESTMENT_TAG_REGEX);
  if (investmentMatch) {
    const extractedType = investmentMatch[1].toLowerCase() as InvestmentType;
    const type = VALID_INVESTMENT_TYPES.includes(extractedType) 
      ? extractedType 
      : 'outros_investimentos';
    
    return {
      type,
      isWithdrawal: false,
      userDescription: description.replace(INVESTMENT_TAG_REGEX, '').trim(),
      hasStructuredTag: true,
    };
  }
  
  // Tenta o formato estruturado de resgate
  const withdrawalMatch = description.match(WITHDRAWAL_TAG_REGEX);
  if (withdrawalMatch) {
    const extractedType = withdrawalMatch[1].toLowerCase() as InvestmentType;
    const type = VALID_INVESTMENT_TYPES.includes(extractedType) 
      ? extractedType 
      : 'outros_investimentos';
    
    return {
      type,
      isWithdrawal: true,
      userDescription: description.replace(WITHDRAWAL_TAG_REGEX, '').trim(),
      hasStructuredTag: true,
    };
  }
  
  // Fallback: usa a função de extração legada
  return {
    type: extractInvestmentType(description),
    isWithdrawal: description.toLowerCase().includes('resgate'),
    userDescription: description,
    hasStructuredTag: false,
  };
};

/**
 * Extrai apenas a descrição do usuário (sem a tag de metadados)
 */
export const getCleanDescription = (description: string): string => {
  return description
    .replace(INVESTMENT_TAG_REGEX, '')
    .replace(WITHDRAWAL_TAG_REGEX, '')
    .trim();
};

/**
 * Verifica se uma descrição tem tag estruturada
 */
export const hasStructuredTag = (description: string): boolean => {
  return INVESTMENT_TAG_REGEX.test(description) || WITHDRAWAL_TAG_REGEX.test(description);
};

import { 
  Landmark, 
  TrendingUp, 
  Building2, 
  Coins, 
  PiggyBank,
  Wallet,
  LucideIcon 
} from 'lucide-react';

// Tipos de investimento
export type InvestmentType = 
  | 'reserva_emergencia'
  | 'acoes'
  | 'fundos_imobiliarios'
  | 'renda_fixa'
  | 'tesouro_direto'
  | 'criptomoedas'
  | 'outros_investimentos';

// Labels para exibição
export const investmentTypeLabels: Record<InvestmentType, string> = {
  reserva_emergencia: 'Reserva de Emergência',
  acoes: 'Ações',
  fundos_imobiliarios: 'Fundos Imobiliários',
  renda_fixa: 'Renda Fixa',
  tesouro_direto: 'Tesouro Direto',
  criptomoedas: 'Criptomoedas',
  outros_investimentos: 'Outros Investimentos',
};

// Ícones para tipos de investimento
export const investmentTypeIcons: Record<InvestmentType, LucideIcon> = {
  reserva_emergencia: PiggyBank,
  acoes: TrendingUp,
  fundos_imobiliarios: Building2,
  renda_fixa: Landmark,
  tesouro_direto: Wallet,
  criptomoedas: Coins,
  outros_investimentos: Coins,
};

// Cores para tipos de investimento
export const investmentTypeColors: Record<InvestmentType, string> = {
  reserva_emergencia: 'hsl(142, 71%, 45%)',
  acoes: 'hsl(199, 89%, 48%)',
  fundos_imobiliarios: 'hsl(25, 95%, 53%)',
  renda_fixa: 'hsl(262, 83%, 58%)',
  tesouro_direto: 'hsl(47, 96%, 53%)',
  criptomoedas: 'hsl(330, 81%, 60%)',
  outros_investimentos: 'hsl(215, 16%, 47%)',
};

// Interface para um investimento individual (derivado de transação)
export interface Investment {
  id: string;
  date: string;
  description: string;
  value: number;
  investmentType: InvestmentType;
  createdAt: number;
}

// Lista de tipos válidos para validação
export const VALID_INVESTMENT_TYPES: InvestmentType[] = [
  'reserva_emergencia',
  'acoes',
  'fundos_imobiliarios',
  'renda_fixa',
  'tesouro_direto',
  'criptomoedas',
  'outros_investimentos',
];

/**
 * Extração legada baseada em texto (para compatibilidade com dados antigos)
 * Use decodeInvestmentDescription de @/core/finance para o sistema completo
 */
export const extractInvestmentType = (description: string): InvestmentType => {
  // Primeiro tenta o formato estruturado
  const investmentMatch = description.match(/^\[INV:([a-z_]+)\]/i);
  if (investmentMatch) {
    const extractedType = investmentMatch[1].toLowerCase() as InvestmentType;
    if (VALID_INVESTMENT_TYPES.includes(extractedType)) {
      return extractedType;
    }
  }
  
  const withdrawalMatch = description.match(/^\[RES:([a-z_]+)\]/i);
  if (withdrawalMatch) {
    const extractedType = withdrawalMatch[1].toLowerCase() as InvestmentType;
    if (VALID_INVESTMENT_TYPES.includes(extractedType)) {
      return extractedType;
    }
  }
  
  // Fallback: parsing legado baseado em texto
  const descLower = description.toLowerCase();
  
  if (descLower.includes('reserva') || descLower.includes('emergência') || descLower.includes('emergencia')) {
    return 'reserva_emergencia';
  }
  if (descLower.includes('ação') || descLower.includes('acao') || descLower.includes('ações') || descLower.includes('acoes')) {
    return 'acoes';
  }
  if (descLower.includes('fii') || descLower.includes('fundo imobiliário') || descLower.includes('fundo imobiliario') || descLower.includes('imobiliário') || descLower.includes('imobiliario')) {
    return 'fundos_imobiliarios';
  }
  if (descLower.includes('renda fixa') || descLower.includes('cdb') || descLower.includes('lci') || descLower.includes('lca')) {
    return 'renda_fixa';
  }
  if (descLower.includes('tesouro') || descLower.includes('selic') || descLower.includes('ipca+')) {
    return 'tesouro_direto';
  }
  if (descLower.includes('cripto') || descLower.includes('bitcoin') || descLower.includes('btc') || descLower.includes('ethereum') || descLower.includes('eth')) {
    return 'criptomoedas';
  }
  
  return 'outros_investimentos';
};

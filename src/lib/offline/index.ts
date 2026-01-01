/**
 * SHIM DE COMPATIBILIDADE
 * 
 * Este arquivo reexporta tudo de src/infra/offline para manter
 * compatibilidade com imports existentes durante a transição.
 * 
 * NÃO ADICIONE NOVA LÓGICA AQUI.
 * Novos imports devem usar @/infra/offline diretamente.
 * 
 * @deprecated Use @/infra/offline diretamente
 */

// Re-export everything from the new location
export * from '@/infra/offline';

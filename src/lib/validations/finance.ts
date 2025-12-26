import { z } from 'zod';

/**
 * Schema de validação para transações financeiras
 */
export const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa'], {
    required_error: 'Selecione o tipo da transação',
  }),
  category: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().min(1, 'Selecione uma data'),
  description: z
    .string()
    .trim()
    .min(1, 'A descrição é obrigatória')
    .max(200, 'A descrição deve ter no máximo 200 caracteres'),
  value: z
    .number({
      required_error: 'O valor é obrigatório',
      invalid_type_error: 'O valor deve ser um número',
    })
    .positive('O valor deve ser maior que zero')
    .max(999999999.99, 'O valor máximo é R$ 999.999.999,99'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Schema de validação para dívidas
 */
export const debtSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome da dívida é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  totalValue: z
    .number({
      required_error: 'O valor total é obrigatório',
      invalid_type_error: 'O valor deve ser um número',
    })
    .positive('O valor total deve ser maior que zero')
    .max(999999999.99, 'O valor máximo é R$ 999.999.999,99'),
  monthlyInstallment: z
    .number({
      required_error: 'A parcela mensal é obrigatória',
      invalid_type_error: 'O valor deve ser um número',
    })
    .positive('A parcela mensal deve ser maior que zero')
    .max(999999999.99, 'O valor máximo é R$ 999.999.999,99'),
  paidValue: z
    .number({
      invalid_type_error: 'O valor deve ser um número',
    })
    .min(0, 'O valor pago não pode ser negativo')
    .max(999999999.99, 'O valor máximo é R$ 999.999.999,99')
    .default(0),
  startDate: z.string().min(1, 'Selecione a data de início'),
}).refine(
  (data) => data.monthlyInstallment <= data.totalValue,
  {
    message: 'A parcela mensal não pode ser maior que o valor total',
    path: ['monthlyInstallment'],
  }
).refine(
  (data) => data.paidValue <= data.totalValue,
  {
    message: 'O valor pago não pode ser maior que o valor total',
    path: ['paidValue'],
  }
);

export type DebtFormData = z.infer<typeof debtSchema>;

/**
 * Helper para extrair erros de validação do Zod
 */
export const getFieldError = (
  errors: z.ZodError | null,
  field: string
): string | undefined => {
  if (!errors) return undefined;
  const fieldError = errors.errors.find((e) => e.path[0] === field);
  return fieldError?.message;
};

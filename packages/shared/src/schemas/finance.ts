import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  category: z.string().min(1),
  date: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  description: z.string().min(1).max(200),
  value: z.number().positive(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const debtSchema = z.object({
  name: z.string().min(1).max(100),
  totalValue: z.number().positive(),
  monthlyInstallment: z.number().positive(),
  paidValue: z.number().min(0).default(0),
  startDate: z.string().min(1),
});

export type DebtFormData = z.infer<typeof debtSchema>;

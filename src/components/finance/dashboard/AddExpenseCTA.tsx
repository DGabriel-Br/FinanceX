import { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionForm } from '../TransactionForm';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Transaction } from '@/types/transaction';

interface AddExpenseCTAProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
}

export const AddExpenseCTA = memo(({ onAddTransaction }: AddExpenseCTAProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    await onAddTransaction(transaction);
    setOpen(false);
  };

  const triggerButton = (
    <Button 
      size="lg" 
      className="w-full h-14 text-base font-semibold gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Plus className="w-5 h-5" />
      Lançar gasto agora
    </Button>
  );

  if (isMobile) {
    return (
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationDuration: '0.5s', animationFillMode: 'both' }}>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            {triggerButton}
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle>Novo Lançamento</DrawerTitle>
            </DrawerHeader>
            <TransactionForm onSubmit={handleSubmit} />
          </DrawerContent>
        </Drawer>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Quanto mais você lança, mais claro fica.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationDuration: '0.5s', animationFillMode: 'both' }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Quanto mais você lança, mais claro fica.
      </p>
    </div>
  );
});

AddExpenseCTA.displayName = 'AddExpenseCTA';

import { ReactNode } from 'react';
import { AdminMobileHeader } from './AdminMobileHeader';
import { AdminMobileNav } from './AdminMobileNav';
import { AdminGuard } from './AdminGuard';

interface AdminMobileLayoutProps {
  children: ReactNode;
}

export const AdminMobileLayout = ({ children }: AdminMobileLayoutProps) => {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <AdminMobileHeader />
        
        <main className="flex-1 overflow-auto px-4 pb-24">
          {/* Subtle background pattern */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-income/5 rounded-full blur-3xl" />
          </div>
          
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        
        <AdminMobileNav />
      </div>
    </AdminGuard>
  );
};

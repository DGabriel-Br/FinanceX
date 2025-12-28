import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminGuard } from './AdminGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {/* Subtle background pattern */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-income/5 rounded-full blur-3xl" />
          </div>
          
          <div className="p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">{children}</main>
      </div>
    </AuthGuard>
  );
}
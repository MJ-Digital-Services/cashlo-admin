'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace('/login');
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Checking session...
      </div>
    );
  }

  if (!token) return null; // brief flash before redirect effect fires

  return <>{children}</>;
}
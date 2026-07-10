'use client';

import { useQuery } from '@tanstack/react-query';
import { calculatorsApi, calculatorTypesApi } from '@/lib/api';

export default function DashboardPage() {
  const { data: calculators } = useQuery({
    queryKey: ['calculators'],
    queryFn: async () => (await calculatorsApi.getAll()).data.data,
  });
  const { data: types } = useQuery({
    queryKey: ['calculator-types'],
    queryFn: async () => (await calculatorTypesApi.getAll()).data.data,
  });

  const total = calculators?.length ?? '—';
  const bankVariants = calculators?.filter((c: any) => c.isBankVariant).length ?? '—';
  const typeCount = types?.length ?? '—';

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Calculators', value: total },
          { label: 'Bank Variants', value: bankVariants },
          { label: 'Calculator Types', value: typeCount },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
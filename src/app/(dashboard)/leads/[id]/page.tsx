'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { distributorApi } from '@/lib/api';
import { DistributorLead } from '@/types';
import { LeadTimeline } from '@/components/leads/LeadTimeline';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => (await distributorApi.getLead(id)).data.data as DistributorLead,
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-6 sm:p-8 text-slate-500">Loading lead...</div>;
  }

  if (isError || !data) {
    return <div className="p-6 sm:p-8 text-red-600">Lead not found.</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <button
        onClick={() => router.push('/leads')}
        className="text-sm text-[#445df0] hover:underline mb-4"
      >
        ← Back to Leads
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.name}</h1>
      <p className="text-slate-500 text-sm mb-6">{data.mobile} · {data.email}</p>

      <div className="mb-6">
        <LeadTimeline lead={data} />
      </div>
      {/* Info sections go here — Step 4 */}
    </div>
  );
}
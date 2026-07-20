'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorApi } from '@/lib/api';
import { DistributorLead } from '@/types';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'lock_lost', label: 'Lock Lost' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'otp_sent', label: 'OTP Sent' },
  { value: 'otp_verified', label: 'OTP Verified' },
  { value: 'lock_acquired', label: 'Lock Acquired' },
  { value: 'order_created', label: 'Order Created' },
];

const CALL_STATUS_OPTIONS = [
  { value: '', label: 'All Call Statuses' },
  { value: 'pending_call', label: 'Pending Call' },
  { value: 'called', label: 'Called' },
  { value: 'converted', label: 'Converted' },
  { value: 'not_required', label: 'Not Required' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'All Payment Methods' },
  { value: 'manual', label: 'Manual' },
  { value: 'razorpay', label: 'Razorpay' },
];

interface LeadsResponse {
  data: DistributorLead[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [leadCallStatus, setLeadCallStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { status, leadCallStatus, paymentMethod, search, page }],
    queryFn: async () =>
      (
        await distributorApi.getLeads({
          status: status || undefined,
          leadCallStatus: leadCallStatus || undefined,
          paymentMethod: paymentMethod || undefined,
          search: search || undefined,
          page,
          limit: 20,
        })
      ).data as LeadsResponse,
  });

  const callStatusMutation = useMutation({
    mutationFn: ({ id, leadCallStatus }: { id: string; leadCallStatus: string }) =>
      distributorApi.updateCallStatus(id, leadCallStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Call status updated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { mode: string; reference: string; notes: string } }) =>
      distributorApi.markPaid(id, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      const lockLost = res?.data?.data?.lockLost;
      if (lockLost) {
        toast.warning('Payment recorded, but the pincode was already taken — arrange a refund.');
      } else {
        toast.success('Payment recorded and pincode confirmed');
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => distributorApi.cancelLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead cancelled, pincode released');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Distributor Leads</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email, mobile, pincode..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={leadCallStatus}
          onChange={(e) => {
            setLeadCallStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        >
          {CALL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        >
          {PAYMENT_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        onUpdateCallStatus={(id, newStatus) => callStatusMutation.mutate({ id, leadCallStatus: newStatus })}
        onMarkPaid={(id, data) => markPaidMutation.mutate({ id, data })}
        onCancelLead={(id) => cancelMutation.mutate(id)}
        isMarkPaidLoading={markPaidMutation.isPending}
      />

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <p>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
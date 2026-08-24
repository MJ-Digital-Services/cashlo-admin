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
  { value: 'activated', label: 'Activated' },
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
  { value: 'qr_self', label: 'QR (Self-submitted)' },
];

interface LeadsResponse {
  data: DistributorLead[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [leadCallStatus, setLeadCallStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [pendingFinalReview, setPendingFinalReview] = useState(false);
  const [pendingBookingReview, setPendingBookingReview] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { status, leadCallStatus, paymentMethod, search, startDate, endDate, page, pendingFinalReview, pendingBookingReview }],
    queryFn: async () =>
      (
        await distributorApi.getLeads({
          status: status || undefined,
          leadCallStatus: leadCallStatus || undefined,
          paymentMethod: paymentMethod || undefined,
          search: search || undefined,
          startDate: (pendingFinalReview || pendingBookingReview) ? undefined : startDate || undefined,
          endDate: (pendingFinalReview || pendingBookingReview) ? undefined : endDate || undefined,
          pendingFinalReview: pendingFinalReview || undefined,
          pendingBookingReview: pendingBookingReview || undefined,
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

  const approveUtrMutation = useMutation({
    mutationFn: (id: string) => distributorApi.approveUtr(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      const lockLost = res?.data?.data?.lockLost;
      if (lockLost) {
        toast.warning('UTR approved, but the pincode was already taken — arrange a refund.');
      } else {
        toast.success('UTR approved and pincode confirmed');
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectUtrMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => distributorApi.rejectUtr(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('UTR rejected, lead moved to call queue');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approveFinalUtrMutation = useMutation({
    mutationFn: (id: string) => distributorApi.approveFinalUtr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Final payment approved — PIN Code activated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectFinalUtrMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => distributorApi.rejectFinalUtr(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Final payment rejected — distributor can resubmit');
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
        <div className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-[#445df0]">
        <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            disabled={pendingFinalReview || pendingBookingReview}
            className="outline-none bg-transparent disabled:opacity-40"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            min={startDate || undefined}
            disabled={pendingFinalReview || pendingBookingReview}
            className="outline-none bg-transparent disabled:opacity-40"
          />
        </div>

        <label className="flex items-center gap-2 px-3 py-2 text-sm border border-emerald-300 bg-emerald-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={pendingFinalReview}
            onChange={(e) => {
              setPendingFinalReview(e.target.checked);
              setPage(1);
            }}
            className="accent-emerald-600"
          />
          <span className="text-emerald-700 font-medium">Pending Final Review</span>
        </label>

        <label className="flex items-center gap-2 px-3 py-2 text-sm border border-amber-300 bg-amber-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={pendingBookingReview}
            onChange={(e) => {
              setPendingBookingReview(e.target.checked);
              setPage(1);
            }}
            className="accent-amber-600"
          />
          <span className="text-amber-700 font-medium">Pending Booking Review</span>
        </label>
      </div>

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        onUpdateCallStatus={(id, newStatus) => callStatusMutation.mutate({ id, leadCallStatus: newStatus })}
        onMarkPaid={(id, data) => markPaidMutation.mutate({ id, data })}
        onCancelLead={(id) => cancelMutation.mutate(id)}
        onApproveUtr={(id) => approveUtrMutation.mutate(id)}
        onRejectUtr={(id, reason) => rejectUtrMutation.mutate({ id, reason })}
        onApproveFinalUtr={(id) => approveFinalUtrMutation.mutate(id)}
        onRejectFinalUtr={(id, reason) => rejectFinalUtrMutation.mutate({ id, reason })}
        isMarkPaidLoading={markPaidMutation.isPending}
        isApproveRejectLoading={approveUtrMutation.isPending || rejectUtrMutation.isPending}
        isApproveRejectFinalLoading={approveFinalUtrMutation.isPending || rejectFinalUtrMutation.isPending}
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
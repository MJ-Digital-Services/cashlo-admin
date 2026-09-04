'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorApi } from '@/lib/api';
import { DistributorLead } from '@/types';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [leadCallStatus, setLeadCallStatus] = useState(() => searchParams.get('leadCallStatus') || '');
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(() => Number(searchParams.get('limit')) || 20);
  const [paymentMethod, setPaymentMethod] = useState(() => searchParams.get('paymentMethod') || '');
  const [startDate, setStartDate] = useState(() => searchParams.get('startDate') || getTodayString());
  const [endDate, setEndDate] = useState(() => searchParams.get('endDate') || getTodayString());
  const [pendingFinalReview, setPendingFinalReview] = useState(() => searchParams.get('pendingFinalReview') === 'true');
  const [pendingBookingReview, setPendingBookingReview] = useState(() => searchParams.get('pendingBookingReview') === 'true');
  const [pendingIdCreation, setPendingIdCreation] = useState(() => searchParams.get('pendingIdCreation') === 'true');
  const [idCreated, setIdCreated] = useState(() => searchParams.get('idCreated') === 'true');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'));

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (leadCallStatus) params.set('leadCallStatus', leadCallStatus);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    if (limit !== 20) params.set('limit', String(limit));
    if (paymentMethod) params.set('paymentMethod', paymentMethod);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (pendingFinalReview) params.set('pendingFinalReview', 'true');
    if (pendingBookingReview) params.set('pendingBookingReview', 'true');
    if (pendingIdCreation) params.set('pendingIdCreation', 'true');
    if (idCreated) params.set('idCreated', 'true');
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    router.replace(`/leads?${params.toString()}`, { scroll: false });
  }, [status, leadCallStatus, search, page, paymentMethod, startDate, endDate, pendingFinalReview, pendingBookingReview, pendingIdCreation, idCreated, limit, sortBy, sortOrder]);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { status, leadCallStatus, paymentMethod, search, startDate, endDate, page, limit, pendingFinalReview, pendingBookingReview, pendingIdCreation, idCreated, sortBy, sortOrder }],
    queryFn: async () =>
      (
        await distributorApi.getLeads({
          status: status || undefined,
          leadCallStatus: leadCallStatus || undefined,
          paymentMethod: paymentMethod || undefined,
          search: search || undefined,
          startDate: (pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated) ? undefined : startDate || undefined,
          endDate: (pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated) ? undefined : endDate || undefined,
          pendingFinalReview: pendingFinalReview || undefined,
          pendingBookingReview: pendingBookingReview || undefined,
          pendingIdCreation: pendingIdCreation || undefined,
          idCreated: idCreated || undefined,
          page,
          limit,
          sortBy,
          sortOrder,
        })
      ).data as LeadsResponse,
  });

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function handleClearFilters() {
    setStatus('');
    setLeadCallStatus('');
    setSearch('');
    setPaymentMethod('');
    setStartDate(getTodayString());
    setEndDate(getTodayString());
    setPendingFinalReview(false);
    setPendingBookingReview(false);
    setPendingIdCreation(false);
    setIdCreated(false);
    setSortBy('createdAt');
    setSortOrder('desc');
    setLimit(20);
    setPage(1);
  }

  async function handleExport() {
    try {
      const res = await distributorApi.exportLeads({
        status: status || undefined,
        leadCallStatus: leadCallStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        search: search || undefined,
        startDate: (pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated) ? undefined : startDate || undefined,
        endDate: (pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated) ? undefined : endDate || undefined,
        pendingFinalReview: pendingFinalReview || undefined,
        pendingBookingReview: pendingBookingReview || undefined,
        pendingIdCreation: pendingIdCreation || undefined,
        idCreated: idCreated || undefined,
        sortBy,
        sortOrder,
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `distributor-leads-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    }
  }

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

  const toggleIdCreatedMutation = useMutation({
    mutationFn: ({ id, idCreated, remark }: { id: string; idCreated: boolean; remark?: string }) =>
      distributorApi.updateIdCreated(id, idCreated, remark),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(variables.idCreated ? 'Marked as ID created' : 'Marked as ID not created');
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
            disabled={pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated}
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
            disabled={pendingFinalReview || pendingBookingReview || pendingIdCreation || idCreated}
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

        <label className="flex items-center gap-2 px-3 py-2 text-sm border border-indigo-300 bg-indigo-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={pendingIdCreation}
            onChange={(e) => {
              setPendingIdCreation(e.target.checked);
              setPage(1);
            }}
            className="accent-indigo-600"
          />
          <span className="text-indigo-700 font-medium">Pending ID Creation</span>
        </label>

        <label className="flex items-center gap-2 px-3 py-2 text-sm border border-teal-300 bg-teal-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={idCreated}
            onChange={(e) => {
              setIdCreated(e.target.checked);
              setPage(1);
            }}
            className="accent-teal-600"
          />
          <span className="text-teal-700 font-medium">ID Created</span>
        </label>

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        >
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>

        <button
          onClick={handleClearFilters}
          className="px-3 py-2 text-sm font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
        >
          Clear Filters
        </button>

        <button
          onClick={handleExport}
          className="px-3 py-2 text-sm font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4]"
        >
          Export CSV
        </button>
      </div>

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onUpdateCallStatus={(id, newStatus) => callStatusMutation.mutate({ id, leadCallStatus: newStatus })}
        onMarkPaid={(id, data) => markPaidMutation.mutate({ id, data })}
        onCancelLead={(id) => cancelMutation.mutate(id)}
        onApproveUtr={(id) => approveUtrMutation.mutate(id)}
        onRejectUtr={(id, reason) => rejectUtrMutation.mutate({ id, reason })}
        onApproveFinalUtr={(id) => approveFinalUtrMutation.mutate(id)}
        onRejectFinalUtr={(id, reason) => rejectFinalUtrMutation.mutate({ id, reason })}
        onToggleIdCreated={(id, idCreated, remark) => toggleIdCreatedMutation.mutate({ id, idCreated, remark })}
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
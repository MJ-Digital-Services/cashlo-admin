'use client';

import { useState } from 'react';
import { DistributorLead, DistributorPaymentEntry } from '@/types';
import { ApproveRejectUtrModal } from './ApproveRejectUtrModal';
import Link from 'next/link';
import { MarkRefundedModal, isRefundEligible, computeRefundAmount, type MarkRefundedPayload } from './MarkRefundedModal';

interface Props {
  leads: DistributorLead[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onUpdateCallStatus: (id: string, leadCallStatus: string) => void;
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string, reason: string) => void;
  onToggleIdCreated: (id: string, idCreated: boolean, remark?: string) => void;
  onMarkRefunded: (id: string, data: MarkRefundedPayload) => void;
  isMarkRefundedLoading?: boolean;
  isReviewLoading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  activated: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  lock_lost: 'bg-orange-100 text-orange-700',
  expired: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-500',
  refunded: 'bg-purple-100 text-purple-700',
  form_submitted: 'bg-slate-100 text-slate-600',
  otp_sent: 'bg-slate-100 text-slate-600',
  otp_verified: 'bg-blue-100 text-blue-700',
  lock_acquired: 'bg-blue-100 text-blue-700',
  order_created: 'bg-yellow-100 text-yellow-700',
};

const CALL_STATUS_OPTIONS = ['not_required', 'pending_call', 'called', 'converted'];

const AMOUNT_VISIBLE_STATUSES = ['lock_acquired', 'order_created', 'paid', 'lock_lost', 'cancelled'];

// Statuses in which an admin can approve/reject the pending payment — must
// match approvePendingPayment's rules in cashlo-backend. (A lock_lost lead's
// pending payment is refunded instead, via Mark Refunded.)
const REVIEWABLE_STATUSES = ['lock_acquired', 'paid'];

// The lead's single pending payment. Leads whose booking UTR was submitted
// before the payments ledger only have it on qrPayment — the backend folds
// that into a real entry on approve/reject, so show it the same way here.
function pendingPayment(lead: DistributorLead): DistributorPaymentEntry | null {
  const entry = lead.payments?.find((p) => p.status === 'pending');
  if (entry) return entry;
  if (lead.qrPayment?.reviewStatus === 'pending') {
    return {
      stage: 'booking',
      method: 'qr_self',
      amount: lead.gst?.totalAmount ?? 118000,
      status: 'pending',
      utr: lead.qrPayment.utr,
      createdAt: lead.qrPayment.submittedAt,
    };
  }
  return null;
}

const STAGE_SHORT: Record<string, string> = { booking: 'booking', full: 'full', final: 'final' };

function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-slate-400">{active ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
      </span>
    </th>
  );
}

function IdCreatedConfirmModal({
  leadName,
  pincode,
  onClose,
  onConfirm,
}: {
  leadName: string;
  pincode: string;
  onClose: () => void;
  onConfirm: (remark: string) => void;
}) {
  const [step, setStep] = useState<'remark' | 'confirm'>('remark');
  const [remark, setRemark] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-5 w-full max-w-sm">
        {step === 'remark' ? (
          <>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Add a remark</h3>
            <p className="text-xs text-slate-500 mb-3">
              {leadName} · Pincode {pincode}
            </p>
            <textarea
              autoFocus
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="e.g. distributor ID / any reference note"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0] resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!remark.trim()) return;
                  setStep('confirm');
                }}
                disabled={!remark.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4] disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Are you sure?</h3>
            <p className="text-xs text-slate-500 mb-3">
              Have you created the distributor ID for {leadName} (Pincode: {pincode})? This
              cannot be undone once confirmed.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setStep('remark')}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => onConfirm(remark.trim())}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Yes, confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LeadsTable({
  leads,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onUpdateCallStatus,
  onApprovePayment,
  onRejectPayment,
  onToggleIdCreated,
  onMarkRefunded,
  isReviewLoading,
  isMarkRefundedLoading,
}: Props) {
  const [reviewLeadId, setReviewLeadId] = useState<string | null>(null);
  const [idCreatedRemarkLeadId, setIdCreatedRemarkLeadId] = useState<string | null>(null);
  const [markRefundedLeadId, setMarkRefundedLeadId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        Loading leads...
      </div>
    );
  }
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        No leads found.
      </div>
    );
  }

  const reviewLead = leads.find((l) => l._id === reviewLeadId) || null;
  const reviewEntry = reviewLead ? pendingPayment(reviewLead) : null;
  const idCreatedRemarkLead = leads.find((l) => l._id === idCreatedRemarkLeadId) || null;
  const markRefundedLead = leads.find((l) => l._id === markRefundedLeadId) || null;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Contact</th>
              <SortableHeader label="Pincode" field="pincode" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Call Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">ID Created</th>
              <SortableHeader label="Updated" field="updatedAt" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead._id}`} className="font-medium text-[#445df0] hover:underline">
                    {lead.name}
                  </Link>
                  {lead.asmCode && <p className="text-xs text-slate-400 mt-0.5">ASM: {lead.asmCode}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{lead.mobile}</p>
                  <p className="text-xs text-slate-400">{lead.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{lead.pincode}</p>
                  <p className="text-xs text-slate-400">
                    {lead.district}, {lead.state}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lead.status.replace(/_/g, ' ')}
                  </span>
                  {lead.plan === 'full' && (
                    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      full plan
                    </span>
                  )}
                  {lead.status === 'lock_lost' && lead.lostReason && (
                    <p className="text-xs text-orange-600 mt-1 max-w-[180px]">{lead.lostReason}</p>
                  )}
                  {pendingPayment(lead) && (
                    <p className="text-xs font-mono text-amber-700 mt-1">
                      {STAGE_SHORT[pendingPayment(lead)!.stage]} UTR: {pendingPayment(lead)!.utr}
                    </p>
                  )}
                  {lead.status === 'cancelled' && (() => {
                    const rejected = [...(lead.payments || [])].reverse().find((p) => p.status === 'failed');
                    const reason = rejected?.rejectionReason || lead.qrPayment?.rejectionReason;
                    return reason ? (
                      <p className="text-xs text-red-600 mt-1 max-w-[180px]">Rejected: {reason}</p>
                    ) : null;
                  })()}
                  {lead.status === 'refunded' && lead.refund && (
                    <p className="text-xs text-purple-600 mt-1">
                      Refunded ₹{(lead.refund.amount / 100).toLocaleString('en-IN')}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {(() => {
                    const pending = pendingPayment(lead);
                    if (pending) {
                      return (
                        <div>
                          <p className="font-medium text-amber-700">
                            ₹{(pending.amount / 100).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-400">{STAGE_SHORT[pending.stage]} payment pending</p>
                        </div>
                      );
                    }
                    if (AMOUNT_VISIBLE_STATUSES.includes(lead.status) && lead.gst?.totalAmount) {
                      return `₹${(lead.gst.totalAmount / 100).toLocaleString('en-IN')}`;
                    }
                    return '—';
                  })()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.leadCallStatus}
                    onChange={(e) => onUpdateCallStatus(lead._id, e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
                  >
                    {CALL_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {lead.status === 'activated' ? (
                    lead.idCreated ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        ✓ Created
                      </span>
                    ) : (
                      <button
                        onClick={() => setIdCreatedRemarkLeadId(lead._id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200"
                      >
                        Not Created
                      </button>
                    )
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(lead.updatedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  {REVIEWABLE_STATUSES.includes(lead.status) && pendingPayment(lead) && (
                    <button
                      onClick={() => setReviewLeadId(lead._id)}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 whitespace-nowrap"
                    >
                      Review {STAGE_SHORT[pendingPayment(lead)!.stage]} payment
                    </button>
                  )}
                  {isRefundEligible(lead) && (
                    <button
                      onClick={() => setMarkRefundedLeadId(lead._id)}
                      className="mt-1.5 px-2.5 py-1 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 whitespace-nowrap"
                    >
                      Mark Refunded
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviewLead && reviewEntry && (
        <ApproveRejectUtrModal
          leadName={reviewLead.name}
          pincode={reviewLead.pincode}
          utr={reviewEntry.utr || ''}
          stage={reviewEntry.stage}
          amount={reviewEntry.amount}
          submittedAt={reviewEntry.createdAt}
          isSubmitting={!!isReviewLoading}
          onClose={() => setReviewLeadId(null)}
          onApprove={() => {
            onApprovePayment(reviewLead._id);
            setReviewLeadId(null);
          }}
          onReject={(reason) => {
            onRejectPayment(reviewLead._id, reason);
            setReviewLeadId(null);
          }}
        />
      )}

      {idCreatedRemarkLead && (
        <IdCreatedConfirmModal
          leadName={idCreatedRemarkLead.name}
          pincode={idCreatedRemarkLead.pincode}
          onClose={() => setIdCreatedRemarkLeadId(null)}
          onConfirm={(remark) => {
            onToggleIdCreated(idCreatedRemarkLead._id, true, remark);
            setIdCreatedRemarkLeadId(null);
          }}
        />
      )}

{markRefundedLead && (
        <MarkRefundedModal
          leadName={markRefundedLead.name}
          pincode={markRefundedLead.pincode}
          refundAmount={computeRefundAmount(markRefundedLead)}
          isSubmitting={!!isMarkRefundedLoading}
          onClose={() => setMarkRefundedLeadId(null)}
          onSubmit={(data) => {
            onMarkRefunded(markRefundedLead._id, data);
            setMarkRefundedLeadId(null);
          }}
        />
      )}
    </div>
  );
}
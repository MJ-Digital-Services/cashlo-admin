'use client';

import { useState } from 'react';
import { DistributorLead } from '@/types';
import { MarkPaidModal } from './MarkPaidModal';
import { ApproveRejectUtrModal } from './ApproveRejectUtrModal';
import Link from 'next/link';

interface Props {
  leads: DistributorLead[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onUpdateCallStatus: (id: string, leadCallStatus: string) => void;
  onMarkPaid: (id: string, data: { mode: string; reference: string; notes: string }) => void;
  onCancelLead: (id: string) => void;
  onApproveUtr: (id: string) => void;
  onRejectUtr: (id: string, reason: string) => void;
  onApproveFinalUtr: (id: string) => void;
  onRejectFinalUtr: (id: string, reason: string) => void;
  onToggleIdCreated: (id: string, idCreated: boolean, remark?: string) => void;
  isMarkPaidLoading?: boolean;
  isApproveRejectLoading?: boolean;
  isApproveRejectFinalLoading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  activated: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  lock_lost: 'bg-orange-100 text-orange-700',
  expired: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-500',
  form_submitted: 'bg-slate-100 text-slate-600',
  otp_sent: 'bg-slate-100 text-slate-600',
  otp_verified: 'bg-blue-100 text-blue-700',
  lock_acquired: 'bg-blue-100 text-blue-700',
  order_created: 'bg-yellow-100 text-yellow-700',
};

const CALL_STATUS_OPTIONS = ['not_required', 'pending_call', 'called', 'converted'];

const AMOUNT_VISIBLE_STATUSES = ['lock_acquired', 'order_created', 'paid', 'lock_lost', 'cancelled'];

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
  onMarkPaid,
  onCancelLead,
  onApproveUtr,
  onRejectUtr,
  onApproveFinalUtr,
  onRejectFinalUtr,
  onToggleIdCreated,
  isMarkPaidLoading,
  isApproveRejectLoading,
  isApproveRejectFinalLoading,
}: Props) {
  const [markPaidLeadId, setMarkPaidLeadId] = useState<string | null>(null);
  const [reviewUtrLeadId, setReviewUtrLeadId] = useState<string | null>(null);
  const [reviewFinalUtrLeadId, setReviewFinalUtrLeadId] = useState<string | null>(null);
  const [idCreatedRemarkLeadId, setIdCreatedRemarkLeadId] = useState<string | null>(null);

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

  const markPaidLead = leads.find((l) => l._id === markPaidLeadId) || null;
  const reviewUtrLead = leads.find((l) => l._id === reviewUtrLeadId) || null;
  const reviewFinalUtrLead = leads.find((l) => l._id === reviewFinalUtrLeadId) || null;
  const idCreatedRemarkLead = leads.find((l) => l._id === idCreatedRemarkLeadId) || null;

  const pendingFinalPayment = (lead: DistributorLead) =>
    lead.payments?.find((p) => p.stage === 'final' && p.status === 'pending' && p.method === 'qr_self');

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
                  {lead.paymentMethod === 'manual' && (
                    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      manual
                    </span>
                  )}
                  {lead.status === 'lock_lost' && lead.lostReason && (
                    <p className="text-xs text-orange-600 mt-1 max-w-[180px]">{lead.lostReason}</p>
                  )}
                  {lead.status === 'paid' && lead.manualPayment?.reference && (
                    <p className="text-xs text-slate-400 mt-1">Ref: {lead.manualPayment.reference}</p>
                  )}
                  {lead.status === 'paid' && pendingFinalPayment(lead) && (
                    <p className="text-xs font-mono text-emerald-700 mt-1">
                      Final UTR: {pendingFinalPayment(lead)?.utr}
                    </p>
                  )}
                  {lead.paymentMethod === 'qr_self' && lead.qrPayment?.reviewStatus === 'pending' && (
                    <p className="text-xs font-mono text-amber-700 mt-1">
                      UTR: {lead.qrPayment.utr}
                    </p>
                  )}
                  {lead.paymentMethod === 'qr_self' && lead.qrPayment?.reviewStatus === 'rejected' && (
                    <p className="text-xs text-red-600 mt-1 max-w-[180px]">
                      Rejected: {lead.qrPayment.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {(() => {
                    const finalPending = pendingFinalPayment(lead);
                    if (finalPending) {
                      return (
                        <div>
                          <p className="font-medium text-emerald-700">
                            ₹{(finalPending.amount / 100).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-400">final payment pending</p>
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
                  {lead.paymentMethod === 'qr_self' && lead.qrPayment?.reviewStatus === 'pending' && (
                    <button
                      onClick={() => setReviewUtrLeadId(lead._id)}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 whitespace-nowrap"
                    >
                      Review UTR
                    </button>
                  )}
                  {lead.status === 'paid' && pendingFinalPayment(lead) && (
                    <button
                      onClick={() => setReviewFinalUtrLeadId(lead._id)}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                    >
                      Review Final Payment
                    </button>
                  )}
                  {((lead.status === 'lock_acquired' && lead.paymentMethod === 'manual') || lead.status === 'lock_lost') && (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setMarkPaidLeadId(lead._id)}
                          className="px-2.5 py-1 text-xs font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4] whitespace-nowrap"
                        >
                          Mark Paid
                        </button>
                        {lead.status === 'lock_acquired' && (
                          <button
                            onClick={() => onCancelLead(lead._id)}
                            className="px-2.5 py-1 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {markPaidLead && (
        <MarkPaidModal
          leadName={markPaidLead.name}
          pincode={markPaidLead.pincode}
          isSubmitting={!!isMarkPaidLoading}
          onClose={() => setMarkPaidLeadId(null)}
          onSubmit={(data) => {
            onMarkPaid(markPaidLead._id, data);
            setMarkPaidLeadId(null);
          }}
        />
      )}

{reviewUtrLead && (
        <ApproveRejectUtrModal
          leadName={reviewUtrLead.name}
          pincode={reviewUtrLead.pincode}
          utr={reviewUtrLead.qrPayment?.utr || ''}
          submittedAt={reviewUtrLead.qrPayment?.submittedAt}
          isSubmitting={!!isApproveRejectLoading}
          onClose={() => setReviewUtrLeadId(null)}
          onApprove={() => {
            onApproveUtr(reviewUtrLead._id);
            setReviewUtrLeadId(null);
          }}
          onReject={(reason) => {
            onRejectUtr(reviewUtrLead._id, reason);
            setReviewUtrLeadId(null);
          }}
        />
      )}

      {reviewFinalUtrLead && (
        <ApproveRejectUtrModal
          leadName={reviewFinalUtrLead.name}
          pincode={reviewFinalUtrLead.pincode}
          utr={pendingFinalPayment(reviewFinalUtrLead)?.utr || ''}
          submittedAt={pendingFinalPayment(reviewFinalUtrLead)?.createdAt}
          isSubmitting={!!isApproveRejectFinalLoading}
          onClose={() => setReviewFinalUtrLeadId(null)}
          onApprove={() => {
            onApproveFinalUtr(reviewFinalUtrLead._id);
            setReviewFinalUtrLeadId(null);
          }}
          onReject={(reason) => {
            onRejectFinalUtr(reviewFinalUtrLead._id, reason);
            setReviewFinalUtrLeadId(null);
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
    </div>
  );
}
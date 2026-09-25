'use client';

import { useState } from 'react';
import { DistributorLead } from '@/types';

export type MarkRefundedPayload = {
  method: 'bank_transfer' | 'wallet';
  utr: string;
  paymentInfo: string;
  remark: string;
};

interface Props {
  leadName: string;
  pincode: string;
  refundAmount: number; // paise — computed from payments[], display only
  onClose: () => void;
  onSubmit: (data: MarkRefundedPayload) => void;
  isSubmitting: boolean;
}

// Matches the backend's REFUND_UTR_REGEX (distributorAdmin.controller.js) —
// alphanumeric only, 6-22 chars. Wallet refunds skip this entirely.
const UTR_REGEX = /^[A-Za-z0-9]{6,22}$/;

export function MarkRefundedModal({ leadName, pincode, refundAmount, onClose, onSubmit, isSubmitting }: Props) {
  const [isWalletRefund, setIsWalletRefund] = useState(false);
  const [utr, setUtr] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [remark, setRemark] = useState('');

  const canSubmit = isWalletRefund
    ? paymentInfo.trim().length > 0 && remark.trim().length > 0
    : UTR_REGEX.test(utr.trim()) && remark.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Mark as Refunded</h2>
        <p className="mt-1 text-sm text-slate-500">
          {leadName} — PIN Code {pincode}
        </p>

        <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-3">
          <p className="text-xs font-medium text-purple-600">Amount to be refunded</p>
          <p className="mt-0.5 text-lg font-semibold text-purple-900">
            ₹{(refundAmount / 100).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-purple-500">
            Auto-calculated from successful payments on this lead — not editable.
          </p>
        </div>

        <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          This will release PIN Code {pincode} back to the available pool, and this action cannot
          be undone.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 select-none">
          <input
            type="checkbox"
            checked={isWalletRefund}
            onChange={(e) => setIsWalletRefund(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          Wallet refunded (no UTR available)
        </label>

        <div className="mt-4 space-y-4">
          {isWalletRefund ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Information
              </label>
              <input
                type="text"
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
                placeholder="e.g. refunded to Cashlo wallet, no reference number"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Refund UTR / Transaction Reference
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. UTR number of the refund transfer"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="e.g. reason for refund, how it was sent"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0] resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSubmit({
                method: isWalletRefund ? 'wallet' : 'bank_transfer',
                utr: isWalletRefund ? '' : utr.trim(),
                paymentInfo: isWalletRefund ? paymentInfo.trim() : '',
                remark: remark.trim(),
              })
            }
            disabled={isSubmitting || !canSubmit}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Refund'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers used by LeadsTable to keep the refund rules in exactly one place.
// Mirror markRefunded in cashlo-backend's distributorAdmin.controller.js.
export function isRefundEligible(lead: DistributorLead): boolean {
  if (lead.idCreated) return false;
  if (!['paid', 'activated', 'lock_lost'].includes(lead.status)) return false;
  // A payment awaiting review must be approved/rejected first — except on a
  // lock_lost lead, where the pending payment is the money being refunded.
  const hasPending = (lead.payments || []).some((p) => p.status === 'pending');
  return lead.status === 'lock_lost' || !hasPending;
}

export function computeRefundAmount(lead: DistributorLead): number {
  const counted = lead.status === 'lock_lost' ? ['success', 'pending'] : ['success'];
  return (lead.payments || [])
    .filter((p) => counted.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
}
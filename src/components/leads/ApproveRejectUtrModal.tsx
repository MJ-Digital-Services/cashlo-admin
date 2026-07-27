'use client';

import { useState } from 'react';

interface Props {
  leadName: string;
  pincode: string;
  utr: string;
  submittedAt?: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isSubmitting: boolean;
}

export function ApproveRejectUtrModal({
  leadName,
  pincode,
  utr,
  submittedAt,
  onClose,
  onApprove,
  onReject,
  isSubmitting,
}: Props) {
  const [mode, setMode] = useState<'review' | 'reject'>('review');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {mode === 'review' ? 'Review Payment Reference' : 'Reject Payment Reference'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {leadName} — PIN Code {pincode}
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Submitted UTR</p>
          <p className="mt-0.5 font-mono text-sm text-slate-900">{utr}</p>
          {submittedAt && (
            <p className="mt-1.5 text-xs text-slate-400">
              Submitted {new Date(submittedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Cross-check this UTR against your bank/UPI merchant statement before approving.
        </p>

        {mode === 'reject' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason for rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. UTR not found in bank statement, amount mismatch"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {mode === 'review' ? (
            <>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setMode('reject')}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4] disabled:opacity-50"
              >
                {isSubmitting ? 'Approving...' : 'Approve & Confirm PIN Code'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode('review')}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={() => onReject(reason)}
                disabled={isSubmitting || !reason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

interface Props {
  leadName: string;
  pincode: string;
  onClose: () => void;
  onSubmit: (data: { mode: string; reference: string; notes: string }) => void;
  isSubmitting: boolean;
}

const MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'qr', label: 'QR Code' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export function MarkPaidModal({ leadName, pincode, onClose, onSubmit, isSubmitting }: Props) {
  const [mode, setMode] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Mark Payment as Received</h2>
        <p className="mt-1 text-sm text-slate-500">
          {leadName} — PIN Code {pincode}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reference / UTR / Transaction ID
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UTR number, screenshot ref"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
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
            onClick={() => onSubmit({ mode, reference, notes })}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4] disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
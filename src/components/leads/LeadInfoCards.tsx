'use client';

import { useState } from 'react';
import { DistributorLead } from '@/types';

const CONSENT_LABELS: Record<string, string> = {
  nonRefundable: 'Non-refundable fee acknowledged',
  terms: 'Terms & conditions accepted',
  kyc: 'KYC consent given',
  genuineMerchants: 'Genuine merchants declaration',
  policyViolation: 'Policy violation declaration',
};

function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-9 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close preview"
        >
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Aadhaar preview"
          className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

export function DistributorInfoCard({ lead }: { lead: DistributorLead }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Distributor Details</h2>
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-slate-500">Pincode</dt>
        <dd className="text-slate-900">{lead.pincode}</dd>

        <dt className="text-slate-500">District</dt>
        <dd className="text-slate-900">{lead.district || '—'}</dd>

        <dt className="text-slate-500">State</dt>
        <dd className="text-slate-900">{lead.state || '—'}</dd>

        <dt className="text-slate-500">Country</dt>
        <dd className="text-slate-900">{lead.country || '—'}</dd>

        {lead.asmCode && (
          <>
            <dt className="text-slate-500">ASM Code</dt>
            <dd className="text-slate-900">{lead.asmCode}</dd>
          </>
        )}

{lead.referralCode && (
          <>
            <dt className="text-slate-500">Referral Code</dt>
            <dd className="text-slate-900">{lead.referralCode}</dd>
          </>
        )}

        {lead.finalReferralCode && (
          <>
            <dt className="text-slate-500">Final Referral Code</dt>
            <dd className="text-slate-900">{lead.finalReferralCode}</dd>
          </>
        )}

        {lead.panCard && (
          <>
            <dt className="text-slate-500">PAN Card</dt>
            <dd className="text-slate-900 font-mono">{lead.panCard}</dd>
          </>
        )}

        {lead.aadhaarAddress && (
          <>
            <dt className="text-slate-500">Aadhaar Address</dt>
            <dd className="text-slate-900">{lead.aadhaarAddress}</dd>
          </>
        )}

        {lead.shopName && (
          <>
            <dt className="text-slate-500">Shop Name</dt>
            <dd className="text-slate-900">{lead.shopName}</dd>
          </>
        )}

        {lead.shopAddress && (
          <>
            <dt className="text-slate-500">Shop Address</dt>
            <dd className="text-slate-900">{lead.shopAddress}</dd>
          </>
        )}

        {lead.idCreated && lead.idCreatedRemark && (
          <>
            <dt className="text-slate-500">ID Created Remark</dt>
            <dd className="text-slate-900">{lead.idCreatedRemark}</dd>
          </>
        )}
      </dl>

      {(lead.aadhaarFrontUrl || lead.aadhaarBackUrl) && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-2">Aadhaar Card</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {([
              ['front', lead.aadhaarFrontUrl],
              ['back', lead.aadhaarBackUrl],
            ] as const).map(([side, url]) =>
              url ? (
                <button
                  key={side}
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="group relative block aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Aadhaar ${side}`}
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium capitalize text-white">
                    {side}
                  </span>
                </button>
              ) : (
                <div
                  key={side}
                  className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-400 capitalize"
                >
                  {side} — not uploaded
                </div>
              )
            )}
          </div>
        </div>
      )}

      {previewUrl && <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}

export function ConsentsCard({ lead }: { lead: DistributorLead }) {
  const entries = Object.entries(CONSENT_LABELS);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Consents</h2>
      <ul className="space-y-2 text-sm">
        {entries.map(([key, label]) => {
            const given = Boolean(lead.consents?.[key as keyof typeof lead.consents]);
          return (
            <li key={key} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  given ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {given ? '✓' : '–'}
              </span>
              <span className={given ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Same split as cashlo-backend's gstBreakdown(): all amounts are GST-inclusive.
function gstSplit(totalPaise: number) {
  const base = Math.round(totalPaise / 1.18);
  return { base, gst: totalPaise - base };
}

const DEFAULT_BOOKING_AMOUNT = 118000;
const DEFAULT_TOTAL_FEE = { booking: 708000, full: 649000 } as const;

export function PaymentSummaryCard({ lead }: { lead: DistributorLead }) {
  const fmt = (paise?: number) => (paise != null ? `₹${(paise / 100).toLocaleString('en-IN')}` : '—');

  const plan = lead.plan ?? 'booking';
  const payments = lead.payments || [];
  const paidSoFar = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const totalDue = lead.totalDistributorFee ?? (lead.status === 'otp_sent' ? undefined : DEFAULT_TOTAL_FEE[plan]);
  const pending = totalDue != null ? Math.max(0, totalDue - paidSoFar) : undefined;

  // Every stage this plan charges, with the amount expected for it. Booking
  // plan: ₹1,180 then the remainder; full plan: one ₹6,490 payment.
  const bookingAmount = lead.gst?.totalAmount && plan === 'booking' ? lead.gst.totalAmount : DEFAULT_BOOKING_AMOUNT;
  const stages =
    plan === 'full'
      ? [{ stage: 'full' as const, label: 'Full payment', amount: totalDue ?? DEFAULT_TOTAL_FEE.full }]
      : [
          { stage: 'booking' as const, label: 'Booking', amount: bookingAmount },
          { stage: 'final' as const, label: 'Final', amount: (totalDue ?? DEFAULT_TOTAL_FEE.booking) - bookingAmount },
        ];

  const stageStatus = (stage: string) => {
    const entries = payments.filter((p) => p.stage === stage);
    if (entries.some((p) => p.status === 'success')) return { text: 'Paid', cls: 'text-emerald-700' };
    if (entries.some((p) => p.status === 'pending')) return { text: 'Under review', cls: 'text-amber-700' };
    return { text: 'Not paid', cls: 'text-slate-400' };
  };

  const totalSplit = totalDue != null ? gstSplit(totalDue) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Payment Summary</h2>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            plan === 'full' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {plan === 'full' ? 'Full plan' : 'Booking plan'}
        </span>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
        {stages.map(({ stage, label, amount }) => {
          const { base, gst } = gstSplit(amount);
          const status = stageStatus(stage);
          return (
            <div key={stage} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">
                  {label} · {fmt(amount)}
                </span>
                <span className={`text-xs font-medium ${status.cls}`}>{status.text}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {fmt(base)} + {fmt(gst)} GST (18%)
              </p>
            </div>
          );
        })}
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        {totalDue != null && totalSplit && (
          <>
            <dt className="text-slate-500">Total Distributor Fee</dt>
            <dd className="text-slate-900">
              {fmt(totalDue)}
              <span className="block text-xs text-slate-400">
                {fmt(totalSplit.base)} + {fmt(totalSplit.gst)} GST
              </span>
            </dd>
          </>
        )}
        <dt className="text-slate-500">Paid So Far</dt>
        <dd className="text-emerald-700 font-medium">{fmt(paidSoFar)}</dd>
        {pending != null && (
          <>
            <dt className="text-slate-500">Pending</dt>
            <dd className={pending > 0 ? 'text-amber-700 font-medium' : 'text-slate-900'}>{fmt(pending)}</dd>
          </>
        )}
        {lead.status === 'refunded' && lead.refund && (
          <>
            <dt className="text-slate-500">Refunded</dt>
            <dd className="text-purple-700 font-medium">{fmt(lead.refund.amount)}</dd>
          </>
        )}
      </dl>

      {(lead.receiptUrl || lead.activationReceiptUrl) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {lead.receiptUrl && (
            <a
              href={lead.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4]"
            >
              {plan === 'full' ? 'Download Receipt' : 'Booking Receipt'}
            </a>
          )}
          {lead.activationReceiptUrl && (
            <a
              href={lead.activationReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4]"
            >
              Final Receipt
            </a>
          )}
        </div>
      )}
    </div>
  );
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
  
  const CALL_STATUS_STYLES: Record<string, string> = {
    not_required: 'bg-slate-100 text-slate-500',
    pending_call: 'bg-amber-100 text-amber-700',
    called: 'bg-blue-100 text-blue-700',
    converted: 'bg-emerald-100 text-emerald-700',
  };
  
  export function StatusCard({ lead }: { lead: DistributorLead }) {
    const rejectedQr = lead.qrPayment?.reviewStatus === 'rejected';
    const rejectedPayment = [...(lead.payments || [])].reverse().find((p) => p.status === 'failed');
  
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Status</h2>
  
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {lead.status.replace(/_/g, ' ')}
          </span>
          {lead.plan === 'full' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              full plan
            </span>
          )}
        </div>
  
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500">Call Status:</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              CALL_STATUS_STYLES[lead.leadCallStatus] || 'bg-slate-100 text-slate-500'
            }`}
          >
            {lead.leadCallStatus.replace(/_/g, ' ')}
          </span>
        </div>
  
        {lead.status === 'lock_lost' && lead.lostReason && (
          <p className="text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2 mt-2">
            Lock Lost: {lead.lostReason}
          </p>
        )}
  
        {rejectedQr && lead.qrPayment?.rejectionReason && (
          <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-2">
            Booking UTR Rejected: {lead.qrPayment.rejectionReason}
          </p>
        )}
  
        {rejectedPayment?.rejectionReason && (
          <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-2">
            {rejectedPayment.stage[0].toUpperCase() + rejectedPayment.stage.slice(1)} Payment Rejected:{' '}
            {rejectedPayment.rejectionReason}
          </p>
        )}

        {lead.status === 'refunded' && lead.refund && (
          <p className="text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 mt-2">
            Refunded ₹{(lead.refund.amount / 100).toLocaleString('en-IN')} ·{' '}
            {lead.refund.method === 'wallet'
              ? `Wallet: ${lead.refund.paymentInfo}`
              : `UTR: ${lead.refund.utr}`}
            {lead.refund.remark ? ` · ${lead.refund.remark}` : ''}
          </p>
        )}
      </div>
    );
  }
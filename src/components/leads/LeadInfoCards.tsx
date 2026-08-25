import { DistributorLead } from '@/types';

const CONSENT_LABELS: Record<string, string> = {
  nonRefundable: 'Non-refundable fee acknowledged',
  terms: 'Terms & conditions accepted',
  kyc: 'KYC consent given',
  genuineMerchants: 'Genuine merchants declaration',
  policyViolation: 'Policy violation declaration',
};

export function DistributorInfoCard({ lead }: { lead: DistributorLead }) {
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
      </dl>
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

export function PaymentSummaryCard({ lead }: { lead: DistributorLead }) {
    const fmt = (paise?: number) => (paise != null ? `₹${(paise / 100).toLocaleString('en-IN')}` : '—');
  
    const paidSoFar = (lead.payments || [])
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
  
    const totalDue = lead.totalDistributorFee;
    const pending = totalDue != null ? totalDue - paidSoFar : undefined;
  
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Payment Summary</h2>
  
        {lead.gst && (
          <dl className="grid grid-cols-2 gap-y-2 text-sm mb-4 pb-4 border-b border-slate-100">
            <dt className="text-slate-500">Booking Base Amount</dt>
            <dd className="text-slate-900">{fmt(lead.gst.baseAmount)}</dd>
            <dt className="text-slate-500">GST</dt>
            <dd className="text-slate-900">{fmt(lead.gst.gstAmount)}</dd>
            <dt className="text-slate-500 font-medium">Booking Total</dt>
            <dd className="text-slate-900 font-medium">{fmt(lead.gst.totalAmount)}</dd>
          </dl>
        )}
  
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          {totalDue != null && (
            <>
              <dt className="text-slate-500">Total Distributor Fee</dt>
              <dd className="text-slate-900">{fmt(totalDue)}</dd>
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
        </dl>
  
        {(lead.activationReceiptUrl || lead.receiptUrl) && (
            <a
            href={lead.activationReceiptUrl || lead.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4]"
        >
            Download Receipt
        </a>
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
    const rejectedFinal = (lead.payments || []).find((p) => p.stage === 'final' && p.status === 'failed');
  
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
          {lead.paymentMethod && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              {lead.paymentMethod}
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
  
        {rejectedFinal?.rejectionReason && (
          <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-2">
            Final Payment Rejected: {rejectedFinal.rejectionReason}
          </p>
        )}
      </div>
    );
  }
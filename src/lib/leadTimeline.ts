import { DistributorLead } from '@/types';

export interface TimelineEvent {
  label: string;
  timestamp: string;
  description?: string;
  tone: 'default' | 'success' | 'warning' | 'error';
}

export function buildLeadTimeline(lead: DistributorLead): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    label: 'Form Submitted',
    timestamp: lead.createdAt,
    description: `${lead.pincode} · ${lead.district}, ${lead.state}`,
    tone: 'default',
  });

  if (lead.otpVerified && lead.otpVerifiedAt) {
    events.push({
      label: 'OTP Verified',
      timestamp: lead.otpVerifiedAt,
      tone: 'default',
    });
  }

  if (lead.qrPayment?.submittedAt) {
    events.push({
      label: 'UTR Submitted (Booking)',
      timestamp: lead.qrPayment.submittedAt,
      description: lead.qrPayment.utr ? `UTR: ${lead.qrPayment.utr}` : undefined,
      tone: 'default',
    });

    if (lead.qrPayment.reviewStatus === 'rejected' && lead.qrPayment.reviewedAt) {
        events.push({
          label: 'Booking UTR Rejected',
          timestamp: lead.qrPayment.reviewedAt,
          description: lead.qrPayment.rejectionReason,
          tone: 'error',
        });
    }
  }

  (lead.payments || []).forEach((p) => {
        const amount = `₹${(p.amount / 100).toLocaleString('en-IN')}`;
        const stageLabel = p.stage === 'final' ? 'Final Payment' : 'Booking Payment';
        const reviewedDiffers =
          p.reviewedAt &&
          p.createdAt &&
          Math.abs(new Date(p.reviewedAt).getTime() - new Date(p.createdAt).getTime()) > 2000;
      
        // Only show a separate "submitted" moment if it's still pending, or if
        // confirmation genuinely happened later (not the same request writing both).
        if (p.createdAt && (p.status === 'pending' || reviewedDiffers)) {
          events.push({
            label: `${stageLabel} Submitted (${p.method})`,
            timestamp: p.createdAt,
            description: amount,
            tone: p.status === 'pending' ? 'warning' : 'default',
          });
        }
      
        if (p.status === 'success') {
          events.push({
            label: `${stageLabel} Confirmed`,
            timestamp: p.reviewedAt || p.createdAt,
            description: amount,
            tone: 'success',
          });
        }
      
        if (p.status === 'failed') {
          events.push({
            label: `${stageLabel} Rejected`,
            timestamp: p.reviewedAt || p.createdAt,
            description: p.rejectionReason || amount,
            tone: 'error',
          });
        }
      });

  if (lead.status === 'lock_lost') {
    events.push({
      label: 'Pincode Lock Lost',
      timestamp: lead.updatedAt,
      description: lead.lostReason,
      tone: 'error',
    });
  }

  if (lead.status === 'cancelled') {
    events.push({
      label: 'Cancelled',
      timestamp: lead.updatedAt,
      tone: 'error',
    });
  }

  if (lead.activatedAt) {
    events.push({
      label: 'Activated',
      timestamp: lead.activatedAt,
      tone: 'success',
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
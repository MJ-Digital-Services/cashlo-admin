import { DistributorLead } from '@/types';
import { buildLeadTimeline } from '@/lib/leadTimeline';

const TONE_DOT: Record<string, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

const TONE_TEXT: Record<string, string> = {
  default: 'text-slate-700',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  error: 'text-red-700',
};

export function LeadTimeline({ lead }: { lead: DistributorLead }) {
  const events = buildLeadTimeline(lead);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Lead Journey</h2>
      <ol className="relative border-l border-slate-200 ml-2">
        {events.map((event, idx) => (
          <li key={idx} className="mb-6 ml-4 last:mb-0">
            <span
              className={`absolute -left-[5px] w-2.5 h-2.5 rounded-full ${TONE_DOT[event.tone]}`}
            />
            <p className={`text-sm font-medium ${TONE_TEXT[event.tone]}`}>{event.label}</p>
            {event.description && (
              <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(event.timestamp).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
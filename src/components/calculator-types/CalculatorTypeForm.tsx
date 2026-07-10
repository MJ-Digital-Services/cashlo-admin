'use client';

import { useState, useEffect } from 'react';
import { CalculatorType } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface CalculatorTypeFormData {
  name: string;
  key: 'emi' | 'sip' | 'swp' | 'fd' | 'rd';
  slug: string;
  icon: string;
  shortDescription: string;
  order: number;
  isActive: boolean;
}

interface Props {
  calculatorType?: CalculatorType | null;
  onSubmit: (data: CalculatorTypeFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#445df0] focus:border-transparent bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const KEY_OPTIONS: CalculatorTypeFormData['key'][] = ['emi', 'sip', 'swp', 'fd', 'rd'];

export function CalculatorTypeForm({ calculatorType, onSubmit, isSubmitting, onCancel }: Props) {
  const [name, setName] = useState('');
  const [key, setKey] = useState<CalculatorTypeFormData['key']>('emi');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (calculatorType) {
      setName(calculatorType.name);
      setKey(calculatorType.key);
      setSlug(calculatorType.slug);
      setIcon(calculatorType.icon ?? '');
      setShortDescription(calculatorType.shortDescription ?? '');
      setOrder(calculatorType.order ?? 0);
      setIsActive(calculatorType.isActive);
    }
  }, [calculatorType]);

  const handleSubmit = async () => {
    if (!name || !key || !slug) {
      toast.error('Name, key, and slug are required');
      return;
    }
    await onSubmit({ name, key, slug, icon, shortDescription, order, isActive });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Calculator Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="SIP Calculator" />
          </Field>
          <Field label="Key *">
            <select
              className={inputCls}
              value={key}
              onChange={(e) => setKey(e.target.value as CalculatorTypeFormData['key'])}
            >
              {KEY_OPTIONS.map((k) => <option key={k} value={k}>{k.toUpperCase()}</option>)}
            </select>
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="sip-calculator" />
          </Field>
          <Field label="Icon (lucide name)">
            <input className={inputCls} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="TrendingUp" />
          </Field>
          <Field label="Order">
            <input type="number" className={inputCls} value={order} onChange={(e) => setOrder(+e.target.value)} />
          </Field>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-[#445df0] w-4 h-4" />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>
        </div>
        <Field label="Short Description">
          <textarea className={inputCls} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} placeholder="Estimate returns on your monthly SIP investments." />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg disabled:opacity-60 transition-colors">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {calculatorType ? 'Update Type' : 'Create Type'}
        </button>
      </div>
    </div>
  );
}
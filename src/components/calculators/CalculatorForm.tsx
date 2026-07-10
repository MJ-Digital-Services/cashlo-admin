'use client';

import { useState, useEffect } from 'react';
import { Calculator, CalculatorType } from '@/types';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { TipTapEditor } from '@/components/shared/TipTapEditor';

export interface CalculatorFormData {
  calculatorType: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  isBankVariant: boolean;
  bankName: string;
  defaults: {
    amount: number; rate: number; minRate: number; maxRate: number;
    years: number; minYears: number; maxYears: number;
  };
  blurb: string;
  articleContent: string;
  faqs: { question: string; answer: string }[];
  isActive: boolean;
  isFeatured: boolean;
}

interface Props {
  calculator?: Calculator | null;
  types: CalculatorType[];
  onSubmit: (data: CalculatorFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#445df0] focus:border-transparent bg-white';

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1.5 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function CalculatorForm({ calculator, types, onSubmit, isSubmitting, onCancel }: Props) {
  const [calculatorType, setCalculatorType] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isBankVariant, setIsBankVariant] = useState(false);
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10.5);
  const [minRate, setMinRate] = useState(5);
  const [maxRate, setMaxRate] = useState(25);
  const [years, setYears] = useState(5);
  const [minYears, setMinYears] = useState(1);
  const [maxYears, setMaxYears] = useState(30);
  const [blurb, setBlurb] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (calculator) {
      setCalculatorType(typeof calculator.calculatorType === 'object' ? calculator.calculatorType._id : calculator.calculatorType);
      setTitle(calculator.title);
      setSlug(calculator.slug);
      setMetaTitle(calculator.metaTitle ?? '');
      setMetaDescription(calculator.metaDescription ?? '');
      setIsBankVariant(calculator.isBankVariant);
      setBankName(calculator.bankName ?? '');
      setAmount(calculator.defaults.amount);
      setRate(calculator.defaults.rate);
      setMinRate(calculator.defaults.minRate ?? 5);
      setMaxRate(calculator.defaults.maxRate ?? 25);
      setYears(calculator.defaults.years);
      setMinYears(calculator.defaults.minYears ?? 1);
      setMaxYears(calculator.defaults.maxYears ?? 30);
      setBlurb(calculator.blurb ?? '');
      setArticleContent(calculator.articleContent ?? '');
      setFaqs(calculator.faqs.length > 0 ? calculator.faqs : [{ question: '', answer: '' }]);
      setIsActive(calculator.isActive);
      setIsFeatured(calculator.isFeatured);
    }
  }, [calculator]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!calculator) setSlug(generateSlug(val));
  };

  const updateFaq = (i: number, field: 'question' | 'answer', val: string) =>
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));
  const addFaq = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!calculatorType || !title || !slug) {
      toast.error('Type, title, and slug are required');
      return;
    }
    if (isBankVariant && !bankName) {
      toast.error('Bank name is required for a bank variant');
      return;
    }
    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    await onSubmit({
      calculatorType, slug, title, metaTitle, metaDescription,
      isBankVariant, bankName,
      defaults: { amount, rate, minRate, maxRate, years, minYears, maxYears },
      blurb, articleContent, faqs: cleanFaqs, isActive, isFeatured,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Calculator Type *">
            <select className={inputCls} value={calculatorType} onChange={(e) => setCalculatorType(e.target.value)}>
              <option value="">Select type</option>
              {types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Title *">
            <input className={inputCls} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Axis Bank SIP Calculator" />
          </Field>
          <Field label="Slug *" span2>
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="axis-bank-sip-calculator" />
          </Field>
          <Field label="Is Bank Variant?">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={isBankVariant} onChange={(e) => setIsBankVariant(e.target.checked)} className="accent-[#445df0] w-4 h-4" />
              <span className="text-sm text-slate-700">Yes, this is a bank/scheme-specific page</span>
            </label>
          </Field>
          {isBankVariant && (
            <Field label="Bank / Scheme Name *">
              <input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Axis Bank" />
            </Field>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Default Slider Values</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Default Amount"><input type="number" className={inputCls} value={amount} onChange={(e) => setAmount(+e.target.value)} /></Field>
          <Field label="Default Rate (%)"><input type="number" step="0.1" className={inputCls} value={rate} onChange={(e) => setRate(+e.target.value)} /></Field>
          <Field label="Default Years"><input type="number" className={inputCls} value={years} onChange={(e) => setYears(+e.target.value)} /></Field>
          <Field label="Min Rate"><input type="number" step="0.1" className={inputCls} value={minRate} onChange={(e) => setMinRate(+e.target.value)} /></Field>
          <Field label="Max Rate"><input type="number" step="0.1" className={inputCls} value={maxRate} onChange={(e) => setMaxRate(+e.target.value)} /></Field>
          <Field label="Min Years"><input type="number" className={inputCls} value={minYears} onChange={(e) => setMinYears(+e.target.value)} /></Field>
          <Field label="Max Years"><input type="number" className={inputCls} value={maxYears} onChange={(e) => setMaxYears(+e.target.value)} /></Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</h2>
        <Field label="Blurb (shown near the widget)">
          <textarea className={inputCls} value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={2} placeholder="Axis Bank offers..." />
        </Field>
        <Field label="Article Content" span2>
            <TipTapEditor
                value={articleContent}
                onChange={setArticleContent}
                placeholder="Write the calculator's long-form article content..."
                minHeight="350px"
            />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">FAQs</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">FAQ {i + 1}</span>
              <button type="button" onClick={() => removeFaq(i)} disabled={faqs.length <= 1} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input className={inputCls} value={faq.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} placeholder="Question" />
            <textarea className={inputCls} value={faq.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} placeholder="Answer" rows={3} />
          </div>
        ))}
        <button type="button" onClick={addFaq} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
          <Plus className="h-3 w-3" /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO</h2>
        <Field label="Meta Title"><input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></Field>
        <Field label="Meta Description"><textarea className={inputCls} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} /></Field>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-[#445df0] w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#445df0] w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Featured (shows in sidebar/nav)</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg disabled:opacity-60 transition-colors">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {calculator ? 'Update Calculator' : 'Create Calculator'}
          </button>
        </div>
      </div>
    </div>
  );
}
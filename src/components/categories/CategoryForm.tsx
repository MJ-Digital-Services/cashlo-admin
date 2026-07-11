'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

interface Props {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#445df0] focus:border-transparent bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function CategoryForm({ category, onSubmit, isSubmitting, onCancel }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description ?? '');
      setOrder(category.order ?? 0);
      setIsActive(category.isActive);
    }
  }, [category]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) setSlug(generateSlug(val));
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }
    await onSubmit({ name, slug, description, order, isActive });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <input className={inputCls} value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Fintech Tips" />
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="fintech-tips" />
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
        <Field label="Description">
          <textarea className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional short description" />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg disabled:opacity-60 transition-colors">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </div>
  );
}
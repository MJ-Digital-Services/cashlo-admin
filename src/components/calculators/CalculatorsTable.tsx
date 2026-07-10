'use client';

import { Calculator } from '@/types';
import { formatDate } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  calculators: Calculator[];
  isLoading: boolean;
  onEdit: (c: Calculator) => void;
  onDelete: (c: Calculator) => void;
}

export function CalculatorsTable({ calculators, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">Loading calculators...</div>;
  }
  if (calculators.length === 0) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">No calculators found.</div>;
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Variant</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Updated</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {calculators.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 max-w-[260px]">
                  <p className="font-medium text-slate-900 truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">/{c.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                    {typeof c.calculatorType === 'object' ? c.calculatorType.key : ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.isBankVariant ? c.bankName : <span className="text-slate-400">Base type</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.updatedAt ? formatDate(c.updatedAt) : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(c)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(c)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'use client';

import { CalculatorType } from '@/types';
import { Pencil } from 'lucide-react';

interface Props {
  types: CalculatorType[];
  isLoading: boolean;
  onEdit: (t: CalculatorType) => void;
}

export function CalculatorTypesTable({ types, isLoading, onEdit }: Props) {
  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">Loading types...</div>;
  }
  if (types.length === 0) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">No calculator types found.</div>;
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Key</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Order</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {types
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                      {t.key}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">/{t.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{t.order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        <Pencil className="h-4 w-4" />
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
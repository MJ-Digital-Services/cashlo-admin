'use client';

import { Category } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  categories: Category[];
  isLoading: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

export function CategoriesTable({ categories, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">Loading categories...</div>;
  }
  if (categories.length === 0) {
    return <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">No categories found.</div>;
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Order</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">/{c.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{c.order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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
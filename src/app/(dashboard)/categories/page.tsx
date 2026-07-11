'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import { CategoriesTable } from '@/components/categories/CategoriesTable';
import { CategoryForm, CategoryFormData } from '@/components/categories/CategoryForm';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoriesApi.getAll({ includeInactive: true })).data.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = async (data: CategoryFormData) => {
    if (editing) await updateMutation.mutateAsync({ id: editing._id, data });
    else await createMutation.mutateAsync(data);
  };

  const handleDelete = (c: Category) => {
    if (confirm(`Delete "${c.name}"? Blogs using this category may be affected.`)) deleteMutation.mutate(c._id);
  };

  if (showForm) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Category' : 'New Category'}</h1>
        <CategoryForm
          category={editing}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>
      <CategoriesTable
        categories={categories}
        isLoading={isLoading}
        onEdit={(c) => { setEditing(c); setShowForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}
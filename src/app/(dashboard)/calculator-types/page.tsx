'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatorTypesApi } from '@/lib/api';
import { CalculatorType } from '@/types';
import { CalculatorTypesTable } from '@/components/calculator-types/CalculatorTypesTable';
import { CalculatorTypeForm, CalculatorTypeFormData } from '@/components/calculator-types/CalculatorTypeForm';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function CalculatorTypesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CalculatorType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['calculator-types'],
    queryFn: async () => (await calculatorTypesApi.getAll()).data.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: CalculatorTypeFormData) => calculatorTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculator-types'] });
      toast.success('Calculator type created');
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CalculatorTypeFormData }) => calculatorTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculator-types'] });
      toast.success('Calculator type updated');
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = async (data: CalculatorTypeFormData) => {
    if (editing) await updateMutation.mutateAsync({ id: editing._id, data });
    else await createMutation.mutateAsync(data);
  };

  if (showForm) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Calculator Type' : 'New Calculator Type'}</h1>
        <CalculatorTypeForm
          calculatorType={editing}
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
        <h1 className="text-2xl font-bold text-slate-900">Calculator Types</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> New Type
        </button>
      </div>
      <CalculatorTypesTable types={types} isLoading={isLoading} onEdit={(t) => { setEditing(t); setShowForm(true); }} />
    </div>
  );
}
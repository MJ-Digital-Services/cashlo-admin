'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatorsApi, calculatorTypesApi } from '@/lib/api';
import { Calculator } from '@/types';
import { CalculatorsTable } from '@/components/calculators/CalculatorsTable';
import { CalculatorForm, CalculatorFormData } from '@/components/calculators/CalculatorForm';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function CalculatorsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Calculator | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: calculators = [], isLoading } = useQuery({
    queryKey: ['calculators'],
    queryFn: async () => (await calculatorsApi.getAll()).data.data,
  });
  const { data: types = [] } = useQuery({
    queryKey: ['calculator-types'],
    queryFn: async () => (await calculatorTypesApi.getAll()).data.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: CalculatorFormData) => calculatorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculators'] });
      toast.success('Calculator created');
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CalculatorFormData }) => calculatorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculators'] });
      toast.success('Calculator updated');
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calculatorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculators'] });
      toast.success('Calculator deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = async (data: CalculatorFormData) => {
    if (editing) await updateMutation.mutateAsync({ id: editing._id, data });
    else await createMutation.mutateAsync(data);
  };

  const handleDelete = (c: Calculator) => {
    if (confirm(`Delete "${c.title}"? This cannot be undone.`)) deleteMutation.mutate(c._id);
  };

  if (showForm) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Calculator' : 'New Calculator'}</h1>
        <CalculatorForm
          calculator={editing}
          types={types}
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
        <h1 className="text-2xl font-bold text-slate-900">Calculators</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> New Calculator
        </button>
      </div>
      <CalculatorsTable
        calculators={calculators}
        isLoading={isLoading}
        onEdit={(c) => { setEditing(c); setShowForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}
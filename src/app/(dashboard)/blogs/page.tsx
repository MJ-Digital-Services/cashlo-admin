'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/lib/api';
import { Blog } from '@/types';
import { BlogsTable } from '@/components/blogs/BlogsTable';
import { BlogForm, BlogFormData } from '@/components/blogs/BlogForm';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Blog | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => (await blogsApi.getAll()).data.data.blogs,
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog created');
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogFormData }) => blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog updated');
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = async (data: BlogFormData) => {
    if (editing) await updateMutation.mutateAsync({ id: editing._id, data });
    else await createMutation.mutateAsync(data);
  };

  const handleDelete = (blog: Blog) => {
    if (confirm(`Delete "${blog.title}"? This cannot be undone.`)) deleteMutation.mutate(blog._id);
  };

  if (showForm) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Blog' : 'New Blog'}</h1>
        <BlogForm
          blog={editing}
          existingBlogs={blogs}
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
        <h1 className="text-2xl font-bold text-slate-900">Blogs</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> New Blog
        </button>
      </div>
      <BlogsTable
        blogs={blogs}
        isLoading={isLoading}
        onEdit={(b) => { setEditing(b); setShowForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import { UsersTable } from '@/components/users/UsersTable';
import { UserFormModal } from '@/components/users/UserFormModal';
import { toast } from 'sonner';

interface UsersResponse {
  data: User[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalUser, setModalUser] = useState<User | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, page }],
    queryFn: async () =>
      (await usersApi.getAll({ search: search || undefined, page, limit: 20 })).data as UsersResponse,
    enabled: currentUser?.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setModalUser(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
      setModalUser(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Backend already enforces this on every request — this is just UX so a
  // non-admin who navigates here directly sees a clear message instead of
  // an empty/broken table.
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          You don&apos;t have access to this page.
        </div>
      </div>
    );
  }

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <button
          onClick={() => setModalUser('new')}
          className="px-4 py-2 text-sm font-medium bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4]"
        >
          + New User
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#445df0]"
        />
      </div>

      <UsersTable
        users={users}
        currentUserId={currentUser?._id || ''}
        isLoading={isLoading}
        onEdit={(u) => setModalUser(u)}
        onDelete={(u) => setDeleteTarget(u)}
      />

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <p>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalUser && (
        <UserFormModal
          user={modalUser === 'new' ? null : modalUser}
          currentUserId={currentUser?._id || ''}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => setModalUser(null)}
          onSubmit={(data) => {
            if (modalUser === 'new') {
              createMutation.mutate(data as { name: string; email: string; password: string; role: string });
            } else {
              updateMutation.mutate({ id: modalUser._id, data });
            }
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Delete User</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-medium">{deleteTarget.name}</span>? This
              can&apos;t be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
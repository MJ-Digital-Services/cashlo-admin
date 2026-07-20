'use client';

import { User } from '@/types';

interface Props {
  users: User[];
  currentUserId: string;
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  sales: 'bg-teal-100 text-teal-700',
};

export function UsersTable({ users, currentUserId, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        Loading users...
      </div>
    );
  }
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 bg-white">
        No users found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isSelf = u._id === currentUserId;
              return (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {u.name}
                      {isSelf && <span className="ml-1.5 text-xs text-slate-400">(you)</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(u)}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => onDelete(u)}
                          className="px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
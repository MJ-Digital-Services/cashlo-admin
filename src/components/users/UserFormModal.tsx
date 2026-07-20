'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

interface Props {
  user: User | null; // null = create mode
  currentUserId: string;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password?: string; role: string; isActive?: boolean }) => void;
  isSubmitting: boolean;
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'sales', label: 'Sales' },
];

export function UserFormModal({ user, currentUserId, onClose, onSubmit, isSubmitting }: Props) {
  const isEdit = !!user;
  const isSelf = user?._id === currentUserId;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'sales'>(user?.role || 'editor');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword('');
    setRole(user?.role || 'editor');
    setIsActive(user?.isActive ?? true);
  }, [user]);

  function handleSubmit() {
    const payload: any = { name, email, role };
    if (!isEdit) payload.password = password;
    if (isEdit && password) payload.password = password;
    if (isEdit) payload.isActive = isActive;
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit User' : 'Create User'}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? '••••••••' : 'Minimum 6 characters'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'sales')}
              disabled={isSelf}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#445df0] disabled:bg-slate-50 disabled:text-slate-400"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {isSelf && <p className="mt-1 text-xs text-slate-400">You can&apos;t change your own role.</p>}
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                disabled={isSelf}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#445df0]"
              />
              Active
              {isSelf && <span className="text-xs text-slate-400">(can&apos;t deactivate yourself)</span>}
            </label>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !email || (!isEdit && !password)}
            className="px-4 py-2 text-sm bg-[#445df0] text-white rounded-lg hover:bg-[#3548d4] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from 'react';

export interface AssigneePickerUser {
  id: string;
  name: string;
  email: string;
  assigned: boolean;
}

interface AssigneePickerProps {
  users: AssigneePickerUser[];
  isLoading?: boolean;
  isMutatingUserId?: string | null;
  onToggle: (user: AssigneePickerUser) => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AssigneePicker({ users, isLoading = false, isMutatingUserId = null, onToggle }: AssigneePickerProps) {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      return user.name.toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery);
    });
  }, [query, users]);

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">Assignees</h4>
        <p className="text-xs text-slate-600">Search users and toggle assignment.</p>
      </div>

      <input
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition placeholder:text-slate-400 focus:ring-2"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or email"
        type="text"
        value={query}
      />

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-1">
        {isLoading ? (
          <p className="px-2 py-3 text-xs text-slate-500">Loading users...</p>
        ) : null}

        {!isLoading && filteredUsers.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-500">No users found.</p>
        ) : null}

        {!isLoading
          ? filteredUsers.map((user) => (
              <button
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isMutatingUserId === user.id}
                key={user.id}
                onClick={() => {
                  void onToggle(user);
                }}
                type="button"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{user.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.assigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {isMutatingUserId === user.id ? 'Saving...' : user.assigned ? 'Assigned' : 'Assign'}
                </span>
              </button>
            ))
          : null}
      </div>
    </section>
  );
}

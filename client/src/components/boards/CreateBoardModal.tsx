import { useState } from 'react';

interface CreateBoardModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateBoardModal({ isOpen, isSubmitting, onClose, onCreate }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Board name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Board name must be 100 characters or fewer');
      return;
    }

    await onCreate(trimmedName);
    setName('');
    setError(null);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Create board</h2>
        <p className="mt-1 text-sm text-slate-600">New boards will start with To Do, In Progress, and Done columns.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="board-name">
              Board name
            </label>
            <input
              id="board-name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              value={name}
            />
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating...' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

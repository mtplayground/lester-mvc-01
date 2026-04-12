import { FormEvent, useState } from 'react';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface CreateTaskFormProps {
  isSubmitting?: boolean;
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

export default function CreateTaskForm({ isSubmitting = false, onCreate }: CreateTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    try {
      setError(null);

      const dueDateIso = dueDate ? new Date(`${dueDate}T00:00:00.000Z`).toISOString() : undefined;

      await onCreate({
        title: trimmedTitle,
        description: description.trim() || undefined,
        dueDate: dueDateIso,
        priority
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
      setIsExpanded(false);
    } catch {
      setError('Failed to create task.');
    }
  }

  if (!isExpanded) {
    return (
      <button
        className="mt-3 w-full rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={() => setIsExpanded(true)}
        type="button"
      >
        + New Task
      </button>
    );
  }

  return (
    <form className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3" onSubmit={(event) => void handleSubmit(event)}>
      <input
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition placeholder:text-slate-400 focus:ring-2"
        disabled={isSubmitting}
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        required
        type="text"
        value={title}
      />

      <textarea
        className="min-h-20 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition placeholder:text-slate-400 focus:ring-2"
        disabled={isSubmitting}
        maxLength={5000}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        value={description}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs font-medium text-slate-600">
          Due date
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            disabled={isSubmitting}
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
        </label>

        <label className="space-y-1 text-xs font-medium text-slate-600">
          Priority
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            disabled={isSubmitting}
            onChange={(event) => setPriority(event.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            value={priority}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => {
            setIsExpanded(false);
            setError(null);
          }}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

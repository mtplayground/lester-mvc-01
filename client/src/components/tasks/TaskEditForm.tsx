import { FormEvent, useMemo, useState } from 'react';

export interface TaskEditValues {
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TaskEditFormProps {
  initialValues: TaskEditValues;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (values: TaskEditValues) => Promise<void>;
}

export default function TaskEditForm({ initialValues, isSaving = false, onCancel, onSave }: TaskEditFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(initialValues.priority);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return (
      title.trim() !== initialValues.title.trim() ||
      description !== initialValues.description ||
      dueDate !== initialValues.dueDate ||
      priority !== initialValues.priority
    );
  }, [title, description, dueDate, priority, initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description,
        dueDate,
        priority
      });
    } catch {
      setError('Failed to save task details.');
    }
  }

  return (
    <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-slate-600">Title</span>
        <input
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
          disabled={isSaving}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          required
          type="text"
          value={title}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-slate-600">Description</span>
        <textarea
          className="min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
          disabled={isSaving}
          maxLength={5000}
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">Due date</span>
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            disabled={isSaving}
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">Priority</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            disabled={isSaving}
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
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Close
        </button>
        <button
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          disabled={isSaving || !isDirty}
          type="submit"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

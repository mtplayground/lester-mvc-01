import axios from 'axios';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';
import LabelBadge from './LabelBadge';
import type { BoardLabel } from './LabelManager';

const taskUpdateSchema = z
  .object({
    id: z.string().min(1),
    columnId: z.string().min(1),
    position: z.number(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    assignees: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) }).passthrough()).optional(),
    labels: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), color: z.string().min(1) }).passthrough()).optional()
  })
  .passthrough();

export interface LabelPickerTask {
  id: string;
  columnId: string;
  position: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignees?: Array<{ id: string; name: string; avatarUrl?: string | null }>;
  labels?: Array<{ id: string; name: string; color: string }>;
}

interface LabelPickerProps {
  labels: BoardLabel[];
  task: LabelPickerTask;
  onTaskUpdate: (task: LabelPickerTask) => void;
}

export default function LabelPicker({ labels, task, onTaskUpdate }: LabelPickerProps) {
  const [query, setQuery] = useState('');
  const [isMutatingLabelId, setIsMutatingLabelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assignedLabelIds = useMemo(() => new Set((task.labels ?? []).map((label) => label.id)), [task.labels]);

  const filteredLabels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return labels;
    }

    return labels.filter((label) => label.name.toLowerCase().includes(normalizedQuery));
  }, [labels, query]);

  async function handleToggleLabel(labelId: string): Promise<void> {
    const isAssigned = assignedLabelIds.has(labelId);

    try {
      setIsMutatingLabelId(labelId);
      setError(null);

      const requestData = {
        taskId: task.id,
        labelId
      };

      const response = isAssigned
        ? await api.delete('/labels/tasks', { data: requestData })
        : await api.post('/labels/tasks', requestData);

      const updatedTask = taskUpdateSchema.parse(response.data);

      onTaskUpdate({
        id: updatedTask.id,
        columnId: updatedTask.columnId,
        position: updatedTask.position,
        title: updatedTask.title,
        description: updatedTask.description ?? null,
        dueDate: updatedTask.dueDate ?? null,
        priority: updatedTask.priority,
        assignees: (updatedTask.assignees ?? []).map((assignee) => ({
          id: assignee.id,
          name: assignee.name,
          avatarUrl: (assignee as { avatarUrl?: string | null }).avatarUrl ?? null
        })),
        labels: (updatedTask.labels ?? []).map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color
        }))
      });
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setError(caughtError.response.data.message);
      } else {
        setError('Failed to update labels.');
      }
    } finally {
      setIsMutatingLabelId(null);
    }
  }

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">Labels</h4>
        <p className="text-xs text-slate-600">Search and attach labels to this task.</p>
      </div>

      <input
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition placeholder:text-slate-400 focus:ring-2"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search labels"
        type="text"
        value={query}
      />

      {error ? <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">{error}</p> : null}

      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-1">
        {filteredLabels.length === 0 ? <p className="px-2 py-3 text-xs text-slate-500">No labels found.</p> : null}

        {filteredLabels.map((label) => {
          const isAssigned = assignedLabelIds.has(label.id);

          return (
            <button
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isMutatingLabelId === label.id}
              key={label.id}
              onClick={() => {
                void handleToggleLabel(label.id);
              }}
              type="button"
            >
              <LabelBadge color={label.color} name={label.name} />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {isMutatingLabelId === label.id ? 'Saving...' : isAssigned ? 'Attached' : 'Attach'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

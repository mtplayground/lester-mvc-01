import axios from 'axios';
import { useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';
import LabelBadge from './LabelBadge';

const boardLabelSchema = z
  .object({
    id: z.string().min(1),
    boardId: z.string().min(1),
    name: z.string().min(1),
    color: z.string().min(1)
  })
  .passthrough();

const boardLabelsSchema = z.array(boardLabelSchema);

export type BoardLabel = z.infer<typeof boardLabelSchema>;

interface LabelManagerProps {
  boardId: string;
  labels: BoardLabel[];
  onLabelsChange: (labels: BoardLabel[]) => void;
}

export default function LabelManager({ boardId, labels, onLabelsChange }: LabelManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0f172a');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshLabels(): Promise<void> {
    const response = await api.get('/labels', { params: { boardId } });
    const parsedLabels = boardLabelsSchema.parse(response.data);
    onLabelsChange(parsedLabels);
  }

  function resetForm(): void {
    setName('');
    setColor('#0f172a');
    setEditingLabelId(null);
  }

  async function handleSubmit(): Promise<void> {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingLabelId) {
        await api.put(`/labels/${editingLabelId}`, { name: trimmedName, color });
      } else {
        await api.post('/labels', { boardId, name: trimmedName, color });
      }

      await refreshLabels();
      resetForm();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setError(caughtError.response.data.message);
      } else {
        setError('Failed to save label.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(labelId: string): Promise<void> {
    const confirmed = window.confirm('Delete this label?');

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.delete(`/labels/${labelId}`);
      await refreshLabels();

      if (editingLabelId === labelId) {
        resetForm();
      }
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setError(caughtError.response.data.message);
      } else {
        setError('Failed to delete label.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        onClick={() => {
          setIsOpen(true);
          setError(null);
        }}
        type="button"
      >
        Manage Labels
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 px-4 py-6" role="presentation">
          <section className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl" role="dialog">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Label Manager</h3>
              <button
                className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  resetForm();
                }}
                type="button"
              >
                Close
              </button>
            </header>

            <div className="mb-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-sm font-semibold text-slate-900">{editingLabelId ? 'Edit label' : 'Create label'}</h4>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
                  disabled={isSubmitting}
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Label name"
                  type="text"
                  value={name}
                />
                <input
                  className="h-10 w-14 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                  disabled={isSubmitting}
                  onChange={(event) => setColor(event.target.value)}
                  type="color"
                  value={color}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                  disabled={isSubmitting}
                  onClick={() => {
                    void handleSubmit();
                  }}
                  type="button"
                >
                  {editingLabelId ? 'Save Label' : 'Create Label'}
                </button>
                {editingLabelId ? (
                  <button
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    onClick={resetForm}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>

            {error ? <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {labels.length === 0 ? <p className="text-sm text-slate-500">No labels yet.</p> : null}
              {labels.map((label) => (
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2" key={label.id}>
                  <LabelBadge color={label.color} name={label.name} />
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                      onClick={() => {
                        setEditingLabelId(label.id);
                        setName(label.name);
                        setColor(label.color);
                        setError(null);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      onClick={() => {
                        void handleDelete(label.id);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

import { useEffect } from 'react';
import PriorityBadge from './PriorityBadge';
import TaskEditForm, { type TaskEditValues } from './TaskEditForm';

interface TaskDetailModalTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TaskDetailModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  task: TaskDetailModalTask | null;
  onClose: () => void;
  onSave: (values: TaskEditValues) => Promise<void>;
}

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
}

function formatReadableDate(value?: string | null): string {
  if (!value) {
    return 'No due date';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No due date';
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function TaskDetailModal({ isOpen, isSaving = false, saveError = null, task, onClose, onSave }: TaskDetailModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 px-4 py-6" onClick={onClose} role="presentation">
      <section
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="mb-4 space-y-2 border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Task Details</h3>
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="text-sm text-slate-500">Task ID: {task.id}</p>
          <p className="text-sm text-slate-600">Due {formatReadableDate(task.dueDate)}</p>
        </header>

        {saveError ? <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p> : null}

        <TaskEditForm
          initialValues={{
            title: task.title,
            description: task.description ?? '',
            dueDate: toDateInputValue(task.dueDate),
            priority: task.priority
          }}
          isSaving={isSaving}
          onCancel={onClose}
          onSave={onSave}
        />
      </section>
    </div>
  );
}

import axios from 'axios';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';
import AssigneePicker, { type AssigneePickerUser } from './AssigneePicker';
import PriorityBadge from './PriorityBadge';
import TaskEditForm, { type TaskEditValues } from './TaskEditForm';

interface TaskDetailModalTask {
  id: string;
  columnId: string;
  position: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignees?: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  }>;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  task: TaskDetailModalTask | null;
  onClose: () => void;
  onSave: (values: TaskEditValues) => Promise<void>;
  onTaskUpdate: (task: TaskDetailModalTask) => void;
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

const assignableUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    assigned: z.boolean()
  })
  .strict();

const assignableUsersSchema = z.array(assignableUserSchema);

const taskUpdateSchema = z
  .object({
    id: z.string().min(1),
    columnId: z.string().min(1),
    position: z.number(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    assignees: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().min(1),
            avatarUrl: z.string().nullable().optional()
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

export default function TaskDetailModal({
  isOpen,
  isSaving = false,
  saveError = null,
  task,
  onClose,
  onSave,
  onTaskUpdate
}: TaskDetailModalProps) {
  const [users, setUsers] = useState<AssigneePickerUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isMutatingUserId, setIsMutatingUserId] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  async function loadAssignableUsers(taskId: string): Promise<void> {
    try {
      setIsLoadingUsers(true);
      setAssignmentError(null);

      const response = await api.get('/assignments/users', { params: { taskId } });
      const parsedUsers = assignableUsersSchema.parse(response.data);
      setUsers(parsedUsers);
    } catch {
      setAssignmentError('Failed to load assignable users.');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }

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

  useEffect(() => {
    if (!isOpen || !task) {
      setUsers([]);
      setAssignmentError(null);
      setIsMutatingUserId(null);
      return;
    }

    void loadAssignableUsers(task.id);
  }, [isOpen, task?.id]);

  if (!isOpen || !task) {
    return null;
  }

  async function handleToggleAssignee(user: AssigneePickerUser): Promise<void> {
    if (!task) {
      return;
    }

    try {
      setIsMutatingUserId(user.id);
      setAssignmentError(null);

      const requestData = {
        taskId: task.id,
        userId: user.id
      };

      const response = user.assigned
        ? await api.delete('/assignments', { data: requestData })
        : await api.post('/assignments', requestData);

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
          avatarUrl: assignee.avatarUrl ?? null
        }))
      });

      const assignedIds = new Set((updatedTask.assignees ?? []).map((assignee) => assignee.id));
      setUsers((previousUsers) =>
        previousUsers.map((candidate) => ({
          ...candidate,
          assigned: assignedIds.has(candidate.id)
        }))
      );
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setAssignmentError(caughtError.response.data.message);
      } else {
        setAssignmentError('Failed to update assignee.');
      }
    } finally {
      setIsMutatingUserId(null);
    }
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
        {assignmentError ? <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{assignmentError}</p> : null}

        <div className="mb-4">
          <AssigneePicker
            isLoading={isLoadingUsers}
            isMutatingUserId={isMutatingUserId}
            onToggle={handleToggleAssignee}
            users={users}
          />
        </div>

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

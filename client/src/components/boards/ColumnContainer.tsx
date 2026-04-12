import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import CreateTaskForm, { type CreateTaskInput } from '../tasks/CreateTaskForm';
import TaskCard, { type TaskCardData } from '../tasks/TaskCard';
import { api } from '../../lib/api';
import ColumnHeader from './ColumnHeader';

interface Column {
  id: string;
  name: string;
  position: number;
}

interface ColumnContainerProps {
  column: Column;
  isBusy?: boolean;
  onRename: (column: Column) => void;
  onDelete: (column: Column) => void;
}

const taskAssigneeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    avatarUrl: z.string().min(1).nullable().optional()
  })
  .strict();

const taskSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    dueDate: z.string().datetime().nullable().optional(),
    position: z.number(),
    assignees: z.array(taskAssigneeSchema).optional()
  })
  .passthrough();

const taskListSchema = z.array(taskSchema);

type Task = z.infer<typeof taskSchema>;

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => left.position - right.position);
}

export default function ColumnContainer({ column, isBusy = false, onRename, onDelete }: ColumnContainerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  async function fetchTasks(): Promise<void> {
    try {
      setIsLoadingTasks(true);
      setTaskError(null);

      const response = await api.get(`/tasks/column/${column.id}`);
      const parsedTasks = taskListSchema.parse(response.data);
      setTasks(sortTasks(parsedTasks));
    } catch {
      setTaskError('Failed to load tasks.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }

  useEffect(() => {
    void fetchTasks();
  }, [column.id]);

  async function handleCreateTask(input: CreateTaskInput): Promise<void> {
    try {
      setIsCreatingTask(true);
      setTaskError(null);

      const response = await api.post('/tasks', {
        columnId: column.id,
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        priority: input.priority
      });

      const createdTask = taskSchema.parse(response.data);

      setTasks((previousTasks) => sortTasks([...previousTasks, createdTask]));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        setTaskError(error.response.data.message);
      } else {
        setTaskError('Failed to create task.');
      }

      throw error;
    } finally {
      setIsCreatingTask(false);
    }
  }

  return (
    <article className="flex h-full min-h-[280px] w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <ColumnHeader
        isBusy={isBusy}
        name={column.name}
        onDelete={() => onDelete(column)}
        onRename={() => onRename(column)}
      />

      {taskError ? <p className="mt-3 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700">{taskError}</p> : null}

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {isLoadingTasks ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            Loading tasks...
          </div>
        ) : null}

        {!isLoadingTasks && sortedTasks.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No tasks yet.
          </div>
        ) : null}

        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={{
              id: task.id,
              title: task.title,
              priority: task.priority,
              dueDate: task.dueDate ?? null,
              assignees: task.assignees
            } satisfies TaskCardData}
          />
        ))}
      </div>

      <CreateTaskForm
        isSubmitting={isBusy || isCreatingTask}
        onCreate={handleCreateTask}
      />
    </article>
  );
}

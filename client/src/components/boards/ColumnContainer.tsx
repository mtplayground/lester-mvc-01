import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CreateTaskForm, { type CreateTaskInput } from '../tasks/CreateTaskForm';
import TaskCard from '../tasks/TaskCard';
import type { BoardTask } from '../../hooks/useDragAndDrop';
import ColumnHeader from './ColumnHeader';
import Skeleton from '../ui/Skeleton';

interface Column {
  id: string;
  name: string;
  position: number;
}

interface ColumnContainerProps {
  column: Column;
  tasks: BoardTask[];
  tasksError?: string | null;
  isLoadingTasks?: boolean;
  isCreatingTask?: boolean;
  isBusy?: boolean;
  draggable?: boolean;
  onTaskClick: (task: BoardTask) => void;
  onCreateTask: (columnId: string, input: CreateTaskInput) => Promise<void>;
  onRename: (column: Column) => void;
  onDelete: (column: Column) => void;
}

export default function ColumnContainer({
  column,
  tasks,
  tasksError = null,
  isLoadingTasks = false,
  isCreatingTask = false,
  isBusy = false,
  draggable = true,
  onTaskClick,
  onCreateTask,
  onRename,
  onDelete
}: ColumnContainerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id
    }
  });

  return (
    <article className="flex h-full min-h-[280px] w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <ColumnHeader
        isBusy={isBusy}
        name={column.name}
        onDelete={() => onDelete(column)}
        onRename={() => onRename(column)}
      />

      {tasksError ? <p className="mt-3 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700">{tasksError}</p> : null}

      <div
        className={`mt-4 flex flex-1 flex-col gap-2 rounded-lg ${isOver ? 'bg-slate-100/80' : ''}`}
        ref={setNodeRef}
      >
        {isLoadingTasks ? (
          <div className="space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : null}

        {!isLoadingTasks ? (
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{
                  id: task.id,
                  columnId: task.columnId,
                  title: task.title,
                  description: task.description ?? null,
                  priority: task.priority,
                  dueDate: task.dueDate ?? null,
                  assignees: task.assignees,
                  labels: task.labels
                }}
                draggable={draggable}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>
        ) : null}

        {!isLoadingTasks && tasks.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No tasks yet.
          </div>
        ) : null}
      </div>

      <CreateTaskForm
        isSubmitting={isBusy || isCreatingTask}
        onCreate={(input) => onCreateTask(column.id, input)}
      />
    </article>
  );
}

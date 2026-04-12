import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import BoardFilters from '../components/boards/BoardFilters';
import LabelManager, { type BoardLabel } from '../components/labels/LabelManager';
import ColumnContainer from '../components/boards/ColumnContainer';
import TaskCard from '../components/tasks/TaskCard';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import type { TaskEditValues } from '../components/tasks/TaskEditForm';
import { type BoardTask, type TasksByColumn, useDragAndDrop } from '../hooks/useDragAndDrop';
import { api } from '../lib/api';
import type { CreateTaskInput } from '../components/tasks/CreateTaskForm';

const columnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.number()
});

const boardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  columns: z.array(columnSchema)
});

const boardListSchema = z.array(boardSchema);

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
    columnId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    dueDate: z.string().datetime().nullable().optional(),
    position: z.number(),
    assignees: z.array(taskAssigneeSchema).optional(),
    labels: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().min(1),
            color: z.string().min(1)
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

const taskListSchema = z.array(taskSchema);

type Board = z.infer<typeof boardSchema>;
type Column = z.infer<typeof columnSchema>;

type TaskReorderInput = {
  id: string;
  columnId: string;
  position: number;
};

function sortTasks(tasks: BoardTask[]): BoardTask[] {
  return [...tasks].sort((left, right) => left.position - right.position);
}

function toBoardTask(task: z.infer<typeof taskSchema>): BoardTask {
  return {
    id: task.id,
    columnId: task.columnId,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    position: task.position,
    assignees: task.assignees,
    labels: task.labels
  };
}

export default function BoardPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [busyColumnId, setBusyColumnId] = useState<string | null>(null);
  const [creatingTaskColumnId, setCreatingTaskColumnId] = useState<string | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});
  const [taskLoadingByColumn, setTaskLoadingByColumn] = useState<Record<string, boolean>>({});
  const [taskErrorsByColumn, setTaskErrorsByColumn] = useState<Record<string, string | null>>({});
  const [boardLabels, setBoardLabels] = useState<BoardLabel[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [taskModalError, setTaskModalError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const sortedColumns = useMemo(
    () => (board ? [...board.columns].sort((left, right) => left.position - right.position) : []),
    [board]
  );

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) {
      return null;
    }

    for (const tasks of Object.values(tasksByColumn)) {
      const task = tasks.find((candidate) => candidate.id === selectedTaskId);

      if (task) {
        return task;
      }
    }

    return null;
  }, [selectedTaskId, tasksByColumn]);

  const assigneeFilterOptions = useMemo(() => {
    const uniqueAssignees = new Map<string, { id: string; name: string }>();

    for (const tasks of Object.values(tasksByColumn)) {
      for (const task of tasks) {
        for (const assignee of task.assignees ?? []) {
          if (!uniqueAssignees.has(assignee.id)) {
            uniqueAssignees.set(assignee.id, { id: assignee.id, name: assignee.name });
          }
        }
      }
    }

    return Array.from(uniqueAssignees.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [tasksByColumn]);

  const filteredTasksByColumn = useMemo(() => {
    if (!selectedAssigneeId) {
      return tasksByColumn;
    }

    return Object.fromEntries(
      Object.entries(tasksByColumn).map(([columnId, tasks]) => [
        columnId,
        tasks.filter((task) => (task.assignees ?? []).some((assignee) => assignee.id === selectedAssigneeId))
      ])
    );
  }, [selectedAssigneeId, tasksByColumn]);

  function setColumnTaskError(columnId: string, message: string | null): void {
    setTaskErrorsByColumn((previous) => ({
      ...previous,
      [columnId]: message
    }));
  }

  async function loadTasksForColumns(columns: Column[]): Promise<void> {
    const loadingState = Object.fromEntries(columns.map((column) => [column.id, true]));
    const errorState = Object.fromEntries(columns.map((column) => [column.id, null]));

    setTaskLoadingByColumn(loadingState);
    setTaskErrorsByColumn(errorState);

    const results = await Promise.all(
      columns.map(async (column) => {
        try {
          const response = await api.get(`/tasks/column/${column.id}`);
          const parsedTasks = taskListSchema.parse(response.data).map(toBoardTask);

          return {
            columnId: column.id,
            tasks: sortTasks(parsedTasks),
            error: null
          };
        } catch {
          return {
            columnId: column.id,
            tasks: [] as BoardTask[],
            error: 'Failed to load tasks.'
          };
        }
      })
    );

    setTasksByColumn(
      Object.fromEntries(results.map((result) => [result.columnId, result.tasks]))
    );

    setTaskLoadingByColumn(
      Object.fromEntries(results.map((result) => [result.columnId, false]))
    );

    setTaskErrorsByColumn(
      Object.fromEntries(results.map((result) => [result.columnId, result.error]))
    );
  }

  async function loadLabels(boardIdValue: string): Promise<void> {
    try {
      const response = await api.get('/labels', { params: { boardId: boardIdValue } });
      const parsedLabels = z.array(
        z
          .object({
            id: z.string().min(1),
            boardId: z.string().min(1),
            name: z.string().min(1),
            color: z.string().min(1)
          })
          .passthrough()
      ).parse(response.data);

      setBoardLabels(parsedLabels);
    } catch {
      setBoardLabels([]);
    }
  }

  async function fetchBoard(): Promise<void> {
    if (!boardId) {
      setError('Board not found.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/boards');
      const boards = boardListSchema.parse(response.data);
      const currentBoard = boards.find((candidate) => candidate.id === boardId);

      if (!currentBoard) {
        setError('Board not found.');
        setBoard(null);
        return;
      }

      setBoard(currentBoard);
      await Promise.all([loadTasksForColumns(currentBoard.columns), loadLabels(currentBoard.id)]);
    } catch {
      setError('Failed to load board. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchBoard();
  }, [boardId]);

  async function handleAddColumn(): Promise<void> {
    if (!board) {
      return;
    }

    const name = window.prompt('Column name');

    if (!name) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setIsAddingColumn(true);
      await api.post('/columns', { boardId: board.id, name: trimmedName });
      await fetchBoard();
    } catch {
      setError('Failed to create column.');
    } finally {
      setIsAddingColumn(false);
    }
  }

  async function handleRenameColumn(column: Column): Promise<void> {
    const nextName = window.prompt('Rename column', column.name);

    if (!nextName) {
      return;
    }

    const trimmedName = nextName.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setBusyColumnId(column.id);
      await api.put(`/columns/${column.id}`, { name: trimmedName });
      await fetchBoard();
    } catch {
      setError('Failed to rename column.');
    } finally {
      setBusyColumnId(null);
    }
  }

  async function handleDeleteColumn(column: Column): Promise<void> {
    const confirmed = window.confirm(`Delete column "${column.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setBusyColumnId(column.id);
      await api.delete(`/columns/${column.id}`);
      await fetchBoard();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setError(caughtError.response.data.message);
      } else {
        setError('Failed to delete column.');
      }
    } finally {
      setBusyColumnId(null);
    }
  }

  async function handleCreateTask(columnId: string, input: CreateTaskInput): Promise<void> {
    try {
      setCreatingTaskColumnId(columnId);
      setColumnTaskError(columnId, null);

      const response = await api.post('/tasks', {
        columnId,
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        priority: input.priority
      });

      const createdTask = toBoardTask(taskSchema.parse(response.data));

      setTasksByColumn((previous) => ({
        ...previous,
        [columnId]: sortTasks([...(previous[columnId] ?? []), createdTask])
      }));
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setColumnTaskError(columnId, caughtError.response.data.message);
      } else {
        setColumnTaskError(columnId, 'Failed to create task.');
      }

      throw caughtError;
    } finally {
      setCreatingTaskColumnId(null);
    }
  }

  function handleOpenTaskModal(task: BoardTask): void {
    setSelectedTaskId(task.id);
    setTaskModalError(null);
  }

  function handleCloseTaskModal(): void {
    setSelectedTaskId(null);
    setTaskModalError(null);
  }

  async function handleSaveTaskDetails(values: TaskEditValues): Promise<void> {
    if (!selectedTask) {
      return;
    }

    try {
      setIsTaskSaving(true);
      setTaskModalError(null);

      const dueDate = values.dueDate ? new Date(`${values.dueDate}T00:00:00.000Z`).toISOString() : null;

      const response = await api.put(`/tasks/${selectedTask.id}`, {
        title: values.title,
        description: values.description || null,
        dueDate,
        priority: values.priority
      });

      const updatedTask = toBoardTask(taskSchema.parse(response.data));
      applyTaskUpdate(updatedTask);
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setTaskModalError(caughtError.response.data.message);
      } else {
        setTaskModalError('Failed to save task details.');
      }

      throw caughtError;
    } finally {
      setIsTaskSaving(false);
    }
  }

  function applyTaskUpdate(updatedTask: BoardTask): void {
    setTasksByColumn((previous) => {
      const sourceColumnId = Object.keys(previous).find((columnId) =>
        (previous[columnId] ?? []).some((task) => task.id === updatedTask.id)
      );

      if (!sourceColumnId) {
        return previous;
      }

      return {
        ...previous,
        [sourceColumnId]: sortTasks(
          (previous[sourceColumnId] ?? []).map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task))
        )
      };
    });
  }

  async function persistReorder(tasks: TaskReorderInput[]): Promise<void> {
    await api.patch('/tasks/reorder', { tasks });
  }

  const { activeTask, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop({
    tasksByColumn,
    setTasksByColumn,
    persistReorder,
    onError: (message) => {
      setError(message);
    }
  });

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading board...</p>;
  }

  if (!board) {
    return (
      <section className="space-y-3">
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error ?? 'Board not found.'}</p>
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => navigate('/')}
          type="button"
        >
          Back to dashboard
        </button>
      </section>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{board.name}</h2>
            <p className="text-sm text-slate-600">Manage columns and keep board structure organized.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LabelManager
              boardId={board.id}
              labels={boardLabels}
              onLabelsChange={setBoardLabels}
            />
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              disabled={isAddingColumn}
              onClick={() => {
                void handleAddColumn();
              }}
              type="button"
            >
              {isAddingColumn ? 'Adding...' : 'Add Column'}
            </button>
          </div>
        </div>

        <BoardFilters
          assignees={assigneeFilterOptions}
          onAssigneeChange={setSelectedAssigneeId}
          selectedAssigneeId={selectedAssigneeId}
        />

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <div className="overflow-x-auto pb-2">
          <div className="flex min-h-[320px] gap-4">
            {sortedColumns.map((column) => (
              <ColumnContainer
                column={column}
                isBusy={busyColumnId === column.id}
                isCreatingTask={creatingTaskColumnId === column.id}
                isLoadingTasks={taskLoadingByColumn[column.id] ?? false}
                key={column.id}
                onCreateTask={handleCreateTask}
                onDelete={(selectedColumn) => {
                  void handleDeleteColumn(selectedColumn);
                }}
                onRename={(selectedColumn) => {
                  void handleRenameColumn(selectedColumn);
                }}
                onTaskClick={handleOpenTaskModal}
                draggable={!selectedAssigneeId}
                tasks={filteredTasksByColumn[column.id] ?? []}
                tasksError={taskErrorsByColumn[column.id]}
              />
            ))}

            {sortedColumns.length === 0 ? (
              <div className="flex min-h-[280px] w-72 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-600">
                No columns yet. Add a column to get started.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72">
            <TaskCard
              draggable={false}
              task={{
                id: activeTask.id,
                columnId: activeTask.columnId,
                title: activeTask.title,
                description: activeTask.description ?? null,
                priority: activeTask.priority,
                dueDate: activeTask.dueDate ?? null,
                assignees: activeTask.assignees
              }}
            />
          </div>
        ) : null}
      </DragOverlay>

      <TaskDetailModal
        availableLabels={boardLabels}
        isOpen={Boolean(selectedTask)}
        isSaving={isTaskSaving}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTaskDetails}
        onTaskUpdate={applyTaskUpdate}
        saveError={taskModalError}
        task={selectedTask}
      />
    </DndContext>
  );
}

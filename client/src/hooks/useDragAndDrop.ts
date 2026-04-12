import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useMemo, useRef, useState } from 'react';

export interface BoardTaskAssignee {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface BoardTask {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  position: number;
  dueDate?: string | null;
  assignees?: BoardTaskAssignee[];
}

export type TasksByColumn = Record<string, BoardTask[]>;

interface ReorderTaskInput {
  id: string;
  columnId: string;
  position: number;
}

interface DragResult {
  tasksByColumn: TasksByColumn;
  touchedColumnIds: string[];
}

interface UseDragAndDropOptions {
  tasksByColumn: TasksByColumn;
  setTasksByColumn: React.Dispatch<React.SetStateAction<TasksByColumn>>;
  persistReorder: (tasks: ReorderTaskInput[]) => Promise<void>;
  onError: (message: string) => void;
}

function cloneTasksByColumn(tasksByColumn: TasksByColumn): TasksByColumn {
  return Object.fromEntries(
    Object.entries(tasksByColumn).map(([columnId, tasks]) => [columnId, [...tasks]])
  );
}

function normalizeColumnPositions(tasks: BoardTask[], columnId: string): BoardTask[] {
  return tasks.map((task, index) => ({
    ...task,
    columnId,
    position: index + 1
  }));
}

function moveTask(
  tasksByColumn: TasksByColumn,
  activeTaskId: string,
  overId: string,
  overType: 'task' | 'column',
  overColumnId: string
): DragResult | null {
  let sourceColumnId: string | null = null;
  let activeIndex = -1;

  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    const foundIndex = tasks.findIndex((task) => task.id === activeTaskId);

    if (foundIndex !== -1) {
      sourceColumnId = columnId;
      activeIndex = foundIndex;
      break;
    }
  }

  if (!sourceColumnId || activeIndex === -1) {
    return null;
  }

  const sourceTasks = [...(tasksByColumn[sourceColumnId] ?? [])];
  const [movingTask] = sourceTasks.splice(activeIndex, 1);

  if (!movingTask) {
    return null;
  }

  const targetColumnId = overColumnId;
  const targetTasks = sourceColumnId === targetColumnId ? sourceTasks : [...(tasksByColumn[targetColumnId] ?? [])];

  let targetIndex = targetTasks.length;

  if (overType === 'task') {
    const foundTargetIndex = targetTasks.findIndex((task) => task.id === overId);
    targetIndex = foundTargetIndex === -1 ? targetTasks.length : foundTargetIndex;
  }

  if (overType === 'task' && sourceColumnId === targetColumnId && activeIndex < targetIndex) {
    targetIndex -= 1;
  }

  targetTasks.splice(targetIndex, 0, {
    ...movingTask,
    columnId: targetColumnId
  });

  const nextTasksByColumn = cloneTasksByColumn(tasksByColumn);

  nextTasksByColumn[sourceColumnId] = normalizeColumnPositions(sourceTasks, sourceColumnId);
  nextTasksByColumn[targetColumnId] = normalizeColumnPositions(targetTasks, targetColumnId);

  const touchedColumnIds = sourceColumnId === targetColumnId ? [sourceColumnId] : [sourceColumnId, targetColumnId];

  return {
    tasksByColumn: nextTasksByColumn,
    touchedColumnIds
  };
}

export function useDragAndDrop({ tasksByColumn, setTasksByColumn, persistReorder, onError }: UseDragAndDropOptions) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const snapshotRef = useRef<TasksByColumn | null>(null);

  const activeTask = useMemo(() => {
    if (!activeTaskId) {
      return null;
    }

    for (const tasks of Object.values(tasksByColumn)) {
      const task = tasks.find((candidate) => candidate.id === activeTaskId);

      if (task) {
        return task;
      }
    }

    return null;
  }, [activeTaskId, tasksByColumn]);

  function handleDragStart(event: DragStartEvent): void {
    setActiveTaskId(String(event.active.id));
    snapshotRef.current = cloneTasksByColumn(tasksByColumn);
  }

  function handleDragCancel(): void {
    const snapshot = snapshotRef.current;

    if (snapshot) {
      setTasksByColumn(snapshot);
    }

    snapshotRef.current = null;
    setActiveTaskId(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;

    if (!over) {
      handleDragCancel();
      return;
    }

    if (String(active.id) === String(over.id)) {
      snapshotRef.current = null;
      setActiveTaskId(null);
      return;
    }

    const overType = over.data.current?.type as 'task' | 'column' | undefined;
    const overColumnId = over.data.current?.columnId as string | undefined;

    if (!overType || !overColumnId) {
      handleDragCancel();
      return;
    }

    const result = moveTask(tasksByColumn, String(active.id), String(over.id), overType, overColumnId);

    if (!result) {
      handleDragCancel();
      return;
    }

    setTasksByColumn(result.tasksByColumn);

    const payload: ReorderTaskInput[] = result.touchedColumnIds.flatMap((columnId) =>
      (result.tasksByColumn[columnId] ?? []).map((task) => ({
        id: task.id,
        columnId,
        position: task.position
      }))
    );

    void persistReorder(payload)
      .catch(() => {
        const snapshot = snapshotRef.current;

        if (snapshot) {
          setTasksByColumn(snapshot);
        }

        onError('Failed to reorder tasks.');
      })
      .finally(() => {
        snapshotRef.current = null;
        setActiveTaskId(null);
      });
  }

  return {
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel
  };
}

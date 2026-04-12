import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

afterEach(() => {
  cleanup();
});

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: ReactNode; onDragEnd?: (event: unknown) => void }) => (
    <div>
      {children}
      <button
        data-testid="mock-dnd-drop"
        onClick={() =>
          onDragEnd?.({
            active: { id: 'task-1' },
            over: {
              id: 'column-1',
              data: {
                current: {
                  type: 'column',
                  columnId: 'column-1'
                }
              }
            }
          })
        }
        type="button"
      >
        trigger-dnd
      </button>
    </div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PointerSensor: class PointerSensor {},
  KeyboardSensor: class KeyboardSensor {},
  closestCorners: () => null,
  useSensor: () => ({}),
  useSensors: (...sensors: unknown[]) => sensors,
  useDroppable: () => ({
    isOver: false,
    setNodeRef: () => undefined
  })
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: () => ({ x: 0, y: 0 }),
  useSortable: ({ id }: { id: string }) => ({
    attributes: { 'data-sortable-id': id },
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false
  })
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => undefined
    }
  }
}));

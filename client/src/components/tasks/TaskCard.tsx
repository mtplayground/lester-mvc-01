import PriorityBadge from './PriorityBadge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskAssignee {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface TaskCardData {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  assignees?: TaskAssignee[];
}

interface TaskCardProps {
  task: TaskCardData;
  draggable?: boolean;
  onClick?: (task: TaskCardData) => void;
}

function getAssigneeInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDueDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function TaskCard({ task, draggable = true, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      columnId: task.columnId
    },
    disabled: !draggable
  });

  const dueDateLabel = formatDueDate(task.dueDate);
  const assignees = task.assignees ?? [];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      className={`space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${draggable ? 'cursor-grab active:cursor-grabbing touch-none' : ''} ${isDragging ? 'opacity-40' : ''}`}
      onClick={() => {
        if (!isDragging && onClick) {
          onClick(task);
        }
      }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-medium text-slate-900">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center justify-between gap-2">
        {dueDateLabel ? <p className="text-xs text-slate-600">Due {dueDateLabel}</p> : <p className="text-xs text-slate-400">No due date</p>}

        {assignees.length > 0 ? (
          <div className="flex items-center -space-x-2">
            {assignees.slice(0, 3).map((assignee) => (
              <div
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 text-[10px] font-semibold text-slate-700"
                key={assignee.id}
                title={assignee.name}
              >
                {assignee.avatarUrl ? (
                  <img alt={assignee.name} className="h-full w-full object-cover" src={assignee.avatarUrl} />
                ) : (
                  getAssigneeInitials(assignee.name)
                )}
              </div>
            ))}
            {assignees.length > 3 ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600">
                +{assignees.length - 3}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">Unassigned</p>
        )}
      </div>
    </article>
  );
}

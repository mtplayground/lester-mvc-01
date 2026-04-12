interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const priorityStyles: Record<PriorityBadgeProps['priority'], string> = {
  LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 ring-rose-200'
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${priorityStyles[priority]}`}>
      {priority.toLowerCase()}
    </span>
  );
}

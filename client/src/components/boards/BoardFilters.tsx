interface AssigneeFilterOption {
  id: string;
  name: string;
}

interface LabelFilterOption {
  id: string;
  name: string;
}

interface BoardFiltersProps {
  assignees: AssigneeFilterOption[];
  labels: LabelFilterOption[];
  selectedAssigneeId: string;
  selectedLabelId: string;
  onAssigneeChange: (assigneeId: string) => void;
  onLabelChange: (labelId: string) => void;
}

export default function BoardFilters({
  assignees,
  labels,
  selectedAssigneeId,
  selectedLabelId,
  onAssigneeChange,
  onLabelChange
}: BoardFiltersProps) {
  const hasActiveFilter = Boolean(selectedAssigneeId) || Boolean(selectedLabelId);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Filter by assignee</span>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            onChange={(event) => onAssigneeChange(event.target.value)}
            value={selectedAssigneeId}
          >
            <option value="">All assignees</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Filter by label</span>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            onChange={(event) => onLabelChange(event.target.value)}
            value={selectedLabelId}
          >
            <option value="">All labels</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilter ? (
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={() => {
              onAssigneeChange('');
              onLabelChange('');
            }}
            type="button"
          >
            Clear Filter
          </button>
        ) : null}
      </div>
    </section>
  );
}

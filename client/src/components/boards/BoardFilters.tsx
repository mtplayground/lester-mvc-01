interface AssigneeFilterOption {
  id: string;
  name: string;
}

interface BoardFiltersProps {
  assignees: AssigneeFilterOption[];
  selectedAssigneeId: string;
  onAssigneeChange: (assigneeId: string) => void;
}

export default function BoardFilters({ assignees, selectedAssigneeId, onAssigneeChange }: BoardFiltersProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
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

        {selectedAssigneeId ? (
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={() => onAssigneeChange('')}
            type="button"
          >
            Clear Filter
          </button>
        ) : null}
      </div>
    </section>
  );
}

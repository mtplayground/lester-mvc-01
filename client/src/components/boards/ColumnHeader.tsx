interface ColumnHeaderProps {
  name: string;
  isBusy?: boolean;
  onRename: () => void;
  onDelete: () => void;
}

export default function ColumnHeader({ name, isBusy = false, onRename, onDelete }: ColumnHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
      <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
      <div className="flex items-center gap-1">
        <button
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={isBusy}
          onClick={onRename}
          type="button"
        >
          Rename
        </button>
        <button
          className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-rose-300"
          disabled={isBusy}
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      </div>
    </header>
  );
}

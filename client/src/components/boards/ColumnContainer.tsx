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

export default function ColumnContainer({ column, isBusy = false, onRename, onDelete }: ColumnContainerProps) {
  return (
    <article className="flex h-full min-h-[280px] w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <ColumnHeader
        isBusy={isBusy}
        name={column.name}
        onDelete={() => onDelete(column)}
        onRename={() => onRename(column)}
      />
      <div className="mt-4 flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
        Tasks will appear here.
      </div>
    </article>
  );
}

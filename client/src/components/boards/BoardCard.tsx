interface BoardCardProps {
  board: {
    id: string;
    name: string;
    columns: Array<{ id: string }>;
  };
  onClick: (boardId: string) => void;
}

export default function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <button
      className="group flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={() => onClick(board.id)}
      type="button"
    >
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700">{board.name}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {board.columns.length} {board.columns.length === 1 ? 'column' : 'columns'}
      </p>
      <span className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">Open board</span>
    </button>
  );
}

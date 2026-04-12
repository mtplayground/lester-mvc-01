interface LabelBadgeProps {
  name: string;
  color: string;
}

export default function LabelBadge({ name, color }: LabelBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-slate-800"
      style={{
        backgroundColor: `${color}1A`,
        borderColor: `${color}66`
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color
        }}
      />
      {name}
    </span>
  );
}

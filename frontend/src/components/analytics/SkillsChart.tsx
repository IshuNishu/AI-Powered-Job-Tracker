interface SkillsChartProps {
  data: { label: string; value: number }[];
}

export default function SkillsChart({ data }: SkillsChartProps) {
  if (!data.length) {
    return <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>No skills data yet — parse some JDs first.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="text-xs font-medium shrink-0"
            style={{ width: 110, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {d.label}
          </span>
          <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `color-mix(in srgb, var(--accent) ${40 + (1 - i / data.length) * 60}%, var(--col-interview))`,
              }}
            />
          </div>
          <span className="text-xs font-bold shrink-0" style={{ color: 'var(--accent)', minWidth: 20, textAlign: 'right' }}>
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

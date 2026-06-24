interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}

export default function DonutChart({ segments, size = 160, thickness = 28 }: DonutChartProps) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: size }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      </div>
    );
  }

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = segments
    .filter((s) => s.value > 0)
    .map((seg) => {
      const pct = seg.value / total;
      const offset = circumference - pct * circumference;
      const rotation = (cumulative / total) * 360 - 90;
      cumulative += seg.value;
      return { ...seg, offset, rotation, pct };
    });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {/* Background ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={thickness}
        />
        {slices.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${circumference * seg.pct - 2} ${circumference * (1 - seg.pct) + 2}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${seg.rotation} ${cx} ${cy})`}
            opacity={0.88}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        ))}
        {/* Centre total */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill="var(--text-primary)"
          fontFamily="'Space Grotesk', sans-serif"
        >
          {total}
        </text>
        <text
          x={cx} y={cy + 13}
          textAnchor="middle"
          fontSize={10}
          fill="var(--text-muted)"
          fontFamily="'Plus Jakarta Sans', sans-serif"
        >
          total
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0">
        {segments.filter((s) => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span className="text-xs font-bold ml-auto pl-3" style={{ color: seg.color }}>
              {seg.value}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

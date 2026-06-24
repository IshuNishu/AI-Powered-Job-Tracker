interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export default function BarChart({ data, color = 'var(--accent)', height = 180 }: BarChartProps) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.floor((100 - data.length * 2) / data.length);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${Math.max(data.length * (barWidth + 2) * 4, 300)} ${height + 40}`}
        width="100%"
        style={{ display: 'block', minWidth: data.length > 6 ? '100%' : undefined }}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const totalWidth = data.length * (barWidth + 2) * 4;
          const slotWidth = totalWidth / data.length;
          const bw = slotWidth * 0.55;
          const x = i * slotWidth + (slotWidth - bw) / 2;
          const barH = maxVal > 0 ? (d.value / maxVal) * height : 0;
          const y = height - barH;

          return (
            <g key={i}>
              {/* Track */}
              <rect
                x={x}
                y={0}
                width={bw}
                height={height}
                rx={4}
                fill="var(--bg-elevated)"
              />
              {/* Fill bar with rounded top */}
              {barH > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={bw}
                  height={barH}
                  rx={4}
                  fill={color}
                  opacity={0.85}
                  style={{ transition: 'height 0.4s ease, y 0.4s ease' }}
                />
              )}
              {/* Value label on top */}
              {d.value > 0 && (
                <text
                  x={x + bw / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={color}
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  {d.value}
                </text>
              )}
              {/* X-axis label */}
              <text
                x={x + bw / 2}
                y={height + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {d.label.length > 4 ? d.label.slice(0, 3) + '…' : d.label}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line
          x1={0}
          y1={height}
          x2={data.length * ((Math.max(data.length * 6, 300) / data.length))}
          y2={height}
          stroke="var(--border)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

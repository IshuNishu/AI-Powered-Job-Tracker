interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: string;
  delay?: string;
}

export default function StatCard({ label, value, sub, color = 'var(--accent)', icon, delay = '0s' }: StatCardProps) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        animationDelay: delay,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
          {value}
        </p>
        <p className="text-sm font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

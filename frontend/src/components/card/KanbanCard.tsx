import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application } from '../../types';

interface Props {
  app: Application;
  onClick: () => void;
}

const colDotColor: Record<string, string> = {
  Applied:        'var(--col-applied)',
  'Phone Screen': 'var(--col-phone)',
  Interview:      'var(--col-interview)',
  Offer:          'var(--col-offer)',
  Rejected:       'var(--col-rejected)',
};

// ── Interview countdown helper ─────────────────────────────────────────────
function getInterviewBadge(interviewDate?: string): { label: string; color: string; bg: string } | null {
  if (!interviewDate) return null;
  const now   = new Date();
  const iDate = new Date(interviewDate);
  const diffMs   = iDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return null;
  if (diffDays < 0)   return { label: 'Interview was yesterday', color: 'var(--col-rejected)',  bg: 'color-mix(in srgb, var(--col-rejected)  12%, transparent)' };
  if (diffDays === 0) return { label: '🎯 Interview Today!',     color: 'var(--col-offer)',     bg: 'color-mix(in srgb, var(--col-offer)     15%, transparent)' };
  if (diffDays === 1) return { label: '⏰ Interview Tomorrow',   color: 'var(--col-phone)',     bg: 'color-mix(in srgb, var(--col-phone)     12%, transparent)' };
  if (diffDays <= 7)  return { label: `📅 Interview in ${diffDays}d`, color: 'var(--col-interview)', bg: 'color-mix(in srgb, var(--col-interview) 12%, transparent)' };
  return null;
}

export default function KanbanCard({ app, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app._id });

  const dotColor  = colDotColor[app.status] ?? 'var(--text-muted)';
  const daysSince = Math.floor((Date.now() - new Date(app.dateApplied).getTime()) / (1000 * 60 * 60 * 24));
  const interviewBadge = getInterviewBadge(app.interviewDate);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity:    isDragging ? 0.3 : 1,
        background: 'var(--bg-elevated)',
        border:     '1px solid var(--border)',
        boxShadow:  'var(--shadow-card)',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative cursor-pointer select-none rounded-xl p-3.5 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      {/* Accent left bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: dotColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{app.company}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{app.role}</p>
        </div>
        <span className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
            <circle cx="4" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
          </svg>
        </span>
      </div>

      {/* ── Interview countdown badge ── */}
      {interviewBadge && (
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 mb-2.5 text-[11px] font-semibold"
          style={{ background: interviewBadge.bg, color: interviewBadge.color }}
        >
          {interviewBadge.label}
        </div>
      )}

      {/* Skills */}
      {app.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {app.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: `color-mix(in srgb, ${dotColor} 15%, transparent)`, color: dotColor }}
            >
              {s}
            </span>
          ))}
          {app.skills.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}>
              +{app.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`}
        </span>
        <div className="flex items-center gap-2">
          {app.salaryRange && (
            <span className="text-[10px] font-semibold" style={{ color: 'var(--col-offer)' }}>{app.salaryRange}</span>
          )}
          {app.resumeSuggestions?.length > 0 && (
            <span title="Has AI suggestions" className="text-[10px]">✨</span>
          )}
        </div>
      </div>
    </div>
  );
}

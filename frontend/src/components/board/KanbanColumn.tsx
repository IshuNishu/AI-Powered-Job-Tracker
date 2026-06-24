import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, KanbanStatus } from '../../types';
import KanbanCard from '../card/KanbanCard';

interface Props {
  status: KanbanStatus;
  applications: Application[];
  onCardClick: (app: Application) => void;
  animIndex: number;
}

const colConfig: Record<KanbanStatus, { color: string; emoji: string; bg: string }> = {
  Applied:        { color: 'var(--col-applied)',   emoji: '📤', bg: 'rgba(79,142,247,0.06)' },
  'Phone Screen': { color: 'var(--col-phone)',     emoji: '📞', bg: 'rgba(246,197,67,0.06)' },
  Interview:      { color: 'var(--col-interview)', emoji: '💼', bg: 'rgba(167,139,250,0.06)' },
  Offer:          { color: 'var(--col-offer)',     emoji: '🎉', bg: 'rgba(52,211,153,0.06)' },
  Rejected:       { color: 'var(--col-rejected)',  emoji: '❌', bg: 'rgba(248,113,113,0.06)' },
};

export default function KanbanColumn({ status, applications, onCardClick, animIndex }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = colConfig[status];

  return (
    <div
      className={`flex flex-col rounded-2xl transition-all duration-200 animate-fade-up`}
      style={{
        animationDelay: `${animIndex * 0.07}s`,
        background: isOver ? `color-mix(in srgb, ${cfg.color} 8%, var(--bg-surface))` : 'var(--bg-surface)',
        border: `1px solid ${isOver ? cfg.color + '50' : 'var(--border)'}`,
        minHeight: '520px',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isOver ? `0 0 0 2px ${cfg.color}30, 0 8px 32px rgba(0,0,0,0.2)` : 'none',
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
        style={{ borderBottom: `1px solid var(--border)` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{cfg.emoji}</span>
          <span className="text-sm font-bold" style={{ color: cfg.color }}>{status}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center"
          style={{ background: `color-mix(in srgb, ${cfg.color} 18%, transparent)`, color: cfg.color }}
        >
          {applications.length}
        </span>
      </div>

      {/* Cards area */}
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext items={applications.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          {applications.map((app, i) => (
            <div
              key={app._id}
              className="animate-fade-up"
              style={{ animationDelay: `${animIndex * 0.07 + i * 0.04}s` }}
            >
              <KanbanCard app={app} onClick={() => onCardClick(app)} />
            </div>
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div
            className="h-24 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-all duration-200"
            style={{
              borderColor: isOver ? cfg.color : 'var(--border)',
              color: isOver ? cfg.color : 'var(--text-muted)',
            }}
          >
            <span className="text-xl">{isOver ? '📥' : '·'}</span>
            <span className="text-xs">{isOver ? 'Drop here' : 'Empty'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

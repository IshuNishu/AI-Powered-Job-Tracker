import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragEndEvent, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { fetchApplications, updateApplicationStatus } from '../services/applicationService';
import { useAuthStore } from '../store/authStore';
import { Application, KanbanStatus } from '../types';
import KanbanColumn from '../components/board/KanbanColumn';
import KanbanCard from '../components/card/KanbanCard';
import AddApplicationModal from '../components/board/AddApplicationModal';
import CardDetailModal from '../components/card/CardDetailModal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { exportToCSV } from '../utils/exportUtils';

const STATUSES: KanbanStatus[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

const statConfig = [
  { key: 'Applied',        label: 'Applied',    color: 'var(--col-applied)',   icon: '📤' },
  { key: 'Interview',      label: 'Interviews', color: 'var(--col-interview)', icon: '💼' },
  { key: 'Offer',          label: 'Offers',     color: 'var(--col-offer)',     icon: '🎉' },
  { key: 'Rejected',       label: 'Rejected',   color: 'var(--col-rejected)',  icon: '❌' },
];

function SkeletonBoard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', minHeight: 520 }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton h-4 w-24 rounded" />
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="skeleton rounded-xl h-20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Search / filter bar ───────────────────────────────────────────────────────
interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: KanbanStatus | 'All';
  onStatusFilter: (v: KanbanStatus | 'All') => void;
  dateFrom: string;
  onDateFrom: (v: string) => void;
  total: number;
  filtered: number;
  onClear: () => void;
}

function FilterBar({ search, onSearch, statusFilter, onStatusFilter, dateFrom, onDateFrom, total, filtered, onClear }: FilterBarProps) {
  const hasFilters = search !== '' || statusFilter !== 'All' || dateFrom !== '';

  return (
    <div
      className="rounded-2xl px-4 py-3 mb-5 animate-fade-up flex flex-wrap gap-3 items-center"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', animationDelay: '0.08s' }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search company or role…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="input-base pl-9 text-sm"
          style={{ paddingTop: 8, paddingBottom: 8 }}
        />
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['All', ...STATUSES] as (KanbanStatus | 'All')[]).map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilter(s)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 hover:scale-105 active:scale-95"
            style={
              statusFilter === s
                ? {
                    background: s === 'All' ? 'var(--accent)' : `var(--col-${s.toLowerCase().replace(' ', '-')}, var(--accent))`,
                    color: '#fff',
                    border: '1px solid transparent',
                  }
                : {
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Date from */}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFrom(e.target.value)}
        className="input-base text-xs"
        style={{ maxWidth: 150, paddingTop: 8, paddingBottom: 8 }}
        title="Filter from date"
      />

      {/* Result count + clear */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hasFilters ? (
            <><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{filtered}</span> of {total}</>
          ) : (
            <>{total} apps</>
          )}
        </span>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs px-2.5 py-1 rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--col-rejected)' }}
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function BoardPage() {
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();

  const [showAdd, setShowAdd]     = useState(false);
  const [selected, setSelected]   = useState<Application | null>(null);
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  // Filter state
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<KanbanStatus | 'All'>('All');
  const [dateFrom, setDateFrom]         = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  });

  const moveMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: KanbanStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    onError: () => toast.error('Failed to move card'),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveApp(null);
    if (!over) return;
    const app = applications.find((a) => a._id === active.id);
    if (!app) return;
    const newStatus = STATUSES.find((s) => s === over.id) ?? app.status;
    if (newStatus !== app.status) moveMut.mutate({ id: app._id, status: newStatus });
  };

  // ── Filtered applications ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.location ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchDate   = !dateFrom || new Date(a.dateApplied) >= new Date(dateFrom);
      return matchSearch && matchStatus && matchDate;
    });
  }, [applications, search, statusFilter, dateFrom]);

  const grouped = useMemo(
    () =>
      STATUSES.reduce<Record<KanbanStatus, Application[]>>((acc, s) => {
        acc[s] = filtered.filter((a) => a.status === s);
        return acc;
      }, {} as Record<KanbanStatus, Application[]>),
    [filtered]
  );

  // Stats use ALL applications (not filtered)
  const allGrouped = useMemo(
    () =>
      STATUSES.reduce<Record<KanbanStatus, Application[]>>((acc, s) => {
        acc[s] = applications.filter((a) => a.status === s);
        return acc;
      }, {} as Record<KanbanStatus, Application[]>),
    [applications]
  );

  const responseRate = applications.length
    ? Math.round(
        ((allGrouped['Phone Screen']?.length ?? 0) +
          (allGrouped['Interview']?.length ?? 0) +
          (allGrouped['Offer']?.length ?? 0)) /
          applications.length *
          100
      )
    : 0;

  const initials = user?.email?.split('@')[0]?.slice(0, 2)?.toUpperCase() ?? 'JT';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDateFrom('');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between animate-slide-down"
        style={{
          background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--col-interview))' }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="relative z-10">J</span>
          </div>
          <span className="font-bold hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            Job<span style={{ color: 'var(--accent)' }}>Tracker</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats pill */}
          <div className="hidden md:flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{applications.length}</span>
            <span>apps</span>
            <span className="mx-1" style={{ color: 'var(--border)' }}>·</span>
            <span className="font-semibold" style={{ color: 'var(--col-offer)' }}>{responseRate}%</span>
            <span>response</span>
          </div>

          {/* Analytics link */}
          <Link
            to="/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span className="hidden sm:inline">Analytics</span>
          </Link>

          {/* CSV Export */}
          <button
            onClick={() => { exportToCSV(applications); toast.success(`Exported ${applications.length} apps ✓`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            title="Export to CSV"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>

          <ThemeToggle />

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid ' + 'var(--accent)' + '40' }}
            >
              {initials}
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hidden sm:block hover:scale-95 active:scale-90"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-5 max-w-[1600px] mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              My Applications
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {applications.length} total · drag cards to update status
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 self-start sm:self-auto"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--col-interview))',
              color: '#fff',
              boxShadow: '0 4px 20px var(--accent-glow)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Application
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {statConfig.map(({ key, label, color, icon }) => (
            <div
              key={key}
              className="rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onClick={() => setStatusFilter(statusFilter === key ? 'All' : key as KanbanStatus)}
            >
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {allGrouped[key as KanbanStatus]?.length ?? 0}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
              {statusFilter === key && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <FilterBar
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          dateFrom={dateFrom}
          onDateFrom={setDateFrom}
          total={applications.length}
          filtered={filtered.length}
          onClear={clearFilters}
        />

        {/* ── Board ── */}
        {isLoading ? (
          <SkeletonBoard />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setActiveApp(applications.find((a) => a._id === e.active.id) ?? null)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 sm:overflow-x-visible sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 no-scrollbar">
              {STATUSES.map((status, i) => (
                <div key={status} className="min-w-[280px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
                  <KanbanColumn
                    status={status}
                    applications={grouped[status]}
                    onCardClick={setSelected}
                    animIndex={i}
                  />
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeApp && (
                <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
                  <KanbanCard app={activeApp} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {showAdd && <AddApplicationModal onClose={() => setShowAdd(false)} />}
      {selected && <CardDetailModal app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

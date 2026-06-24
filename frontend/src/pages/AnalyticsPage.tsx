import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '../services/applicationService';
import { Application, KanbanStatus } from '../types';
import StatCard from '../components/analytics/StatCard';
import DonutChart from '../components/analytics/DonutChart';
import BarChart from '../components/analytics/BarChart';
import SkillsChart from '../components/analytics/SkillsChart';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuthStore } from '../store/authStore';

const STATUS_COLORS: Record<KanbanStatus, string> = {
  Applied:        'var(--col-applied)',
  'Phone Screen': 'var(--col-phone)',
  Interview:      'var(--col-interview)',
  Offer:          'var(--col-offer)',
  Rejected:       'var(--col-rejected)',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function SkeletonCard() {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-6 w-16 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { logout } = useAuthStore();
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  });

  const stats = useMemo(() => {
    const total = applications.length;
    const byStatus = applications.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {});

    const interviews = (byStatus['Interview'] ?? 0) + (byStatus['Phone Screen'] ?? 0);
    const offers     = byStatus['Offer']    ?? 0;
    const rejected   = byStatus['Rejected'] ?? 0;
    const applied    = byStatus['Applied']  ?? 0;
    const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;
    const responseRate = total > 0
      ? Math.round(((interviews + offers) / total) * 100)
      : 0;

    const now = new Date();
    const monthData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: MONTHS[d.getMonth()], month: d.getMonth(), year: d.getFullYear(), value: 0 };
    });
    applications.forEach((a: Application) => {
      const d = new Date(a.dateApplied);
      const idx = monthData.findIndex((m) => m.month === d.getMonth() && m.year === d.getFullYear());
      if (idx !== -1) monthData[idx].value++;
    });

    const donutSegments: { label: string; value: number; color: string }[] = (
      ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'] as KanbanStatus[]
    ).map((s) => ({ label: s, value: byStatus[s] ?? 0, color: STATUS_COLORS[s] }));

    const skillCount: Record<string, number> = {};
    applications.forEach((a: Application) => {
      (a.skills ?? []).forEach((sk) => {
        const key = sk.trim().toLowerCase();
        if (key) skillCount[key] = (skillCount[key] ?? 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const movedApps = applications.filter(
      (a: Application) => a.status === 'Interview' || a.status === 'Offer'
    );
    const avgDays = movedApps.length > 0
      ? Math.round(
          movedApps.reduce((sum: number, a: Application) => {
            return sum + Math.floor((Date.now() - new Date(a.dateApplied).getTime()) / 86400000);
          }, 0) / movedApps.length
        )
      : null;

    return { total, interviews, offers, rejected, applied, successRate, responseRate, monthData, donutSegments, topSkills, avgDays };
  }, [applications]);

  const SectionCard = ({ children, title, delay = '0s' }: { children: React.ReactNode; title: string; delay?: string }) => (
    <div
      className="rounded-2xl p-5 animate-fade-up"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', animationDelay: delay }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <nav
        className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between animate-slide-down"
        style={{
          background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--col-interview))' }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>J</span>
          </div>
          <span className="font-bold hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            Job<span style={{ color: 'var(--accent)' }}>Tracker</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/board"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span className="hidden sm:inline">Back to Board</span>
            <span className="sm:hidden">Board</span>
          </Link>

          <ThemeToggle />

          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-95 active:scale-90 hidden sm:block"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your job search at a glance
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard icon="📋" label="Total Applied"  value={stats.total}               color="var(--col-applied)"   delay="0s" />
            <StatCard icon="📞" label="Interviews"     value={stats.interviews}          color="var(--col-interview)" delay="0.05s" />
            <StatCard icon="🎉" label="Offers"         value={stats.offers}              color="var(--col-offer)"     delay="0.10s" />
            <StatCard icon="❌" label="Rejected"       value={stats.rejected}            color="var(--col-rejected)"  delay="0.15s" />
            <StatCard icon="📈" label="Success Rate"   value={`${stats.successRate}%`}   color="var(--col-offer)"     sub="offers ÷ total"      delay="0.20s" />
            <StatCard icon="⚡" label="Response Rate"  value={`${stats.responseRate}%`}  color="var(--col-interview)" sub="interviews + offers"  delay="0.25s" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SectionCard title="Applications per month — last 6 months" delay="0.1s">
              {isLoading ? (
                <div className="skeleton h-40 rounded-xl" />
              ) : stats.total === 0 ? (
                <EmptyState message="No applications tracked yet." />
              ) : (
                <BarChart data={stats.monthData} color="var(--col-applied)" height={160} />
              )}
            </SectionCard>
          </div>

          <SectionCard title="Status distribution" delay="0.15s">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="skeleton w-32 h-32 rounded-full" />
              </div>
            ) : (
              <DonutChart segments={stats.donutSegments} size={150} thickness={26} />
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Top skills demanded" delay="0.2s">
            {isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}
              </div>
            ) : (
              <SkillsChart data={stats.topSkills} />
            )}
          </SectionCard>

          <SectionCard title="Key insights" delay="0.25s">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : stats.total === 0 ? (
              <EmptyState message="Add some applications to see insights." />
            ) : (
              <div className="space-y-3">
                <InsightRow
                  icon="🎯"
                  label="Success rate"
                  value={`${stats.successRate}%`}
                  color="var(--col-offer)"
                  sub={stats.offers > 0 ? `${stats.offers} offer${stats.offers > 1 ? 's' : ''} from ${stats.total} apps` : 'Keep applying!'}
                />
                <InsightRow
                  icon="📬"
                  label="Response rate"
                  value={`${stats.responseRate}%`}
                  color="var(--col-interview)"
                  sub={`${stats.interviews + stats.offers} responses received`}
                />
                {stats.avgDays !== null && (
                  <InsightRow
                    icon="⏱️"
                    label="Avg. days to interview"
                    value={`${stats.avgDays}d`}
                    color="var(--col-phone)"
                    sub="from applied to interview stage"
                  />
                )}
                <InsightRow
                  icon="📊"
                  label="Most active month"
                  value={(() => {
                    const best = [...stats.monthData].sort((a, b) => b.value - a.value)[0];
                    return best?.value > 0 ? best.label : '—';
                  })()}
                  color="var(--accent)"
                  sub="highest applications in last 6 months"
                />
                {stats.topSkills[0] && (
                  <InsightRow
                    icon="🔧"
                    label="Most requested skill"
                    value={stats.topSkills[0].label}
                    color="var(--col-interview)"
                    sub={`appears in ${stats.topSkills[0].value} JD${stats.topSkills[0].value > 1 ? 's' : ''}`}
                  />
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function InsightRow({ icon, label, value, color, sub }: { icon: string; label: string; value: string; color: string; sub: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
      <p className="text-sm font-bold shrink-0" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <span className="text-3xl">📭</span>
      <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
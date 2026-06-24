import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateApplication, deleteApplication } from '../../services/applicationService';
import { Application, KanbanStatus } from '../../types';
import ATSModal from './ATSModal';

const STATUSES: KanbanStatus[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

interface Props {
  app: Application;
  onClose: () => void;
}

const statusStyle: Record<KanbanStatus, { color: string; bg: string }> = {
  Applied:        { color: 'var(--col-applied)',   bg: 'color-mix(in srgb, var(--col-applied)   15%, transparent)' },
  'Phone Screen': { color: 'var(--col-phone)',     bg: 'color-mix(in srgb, var(--col-phone)     15%, transparent)' },
  Interview:      { color: 'var(--col-interview)', bg: 'color-mix(in srgb, var(--col-interview) 15%, transparent)' },
  Offer:          { color: 'var(--col-offer)',     bg: 'color-mix(in srgb, var(--col-offer)     15%, transparent)' },
  Rejected:       { color: 'var(--col-rejected)',  bg: 'color-mix(in srgb, var(--col-rejected)  15%, transparent)' },
};

// Convert ISO date string to yyyy-mm-dd for <input type="date">
function toDateInputValue(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export default function CardDetailModal({ app, onClose }: Props) {
  const qc = useQueryClient();
  const [editing, setEditing]             = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showATS, setShowATS]             = useState(false);
  const [form, setForm] = useState({
    company:       app.company,
    role:          app.role,
    status:        app.status,
    notes:         app.notes         ?? '',
    jdLink:        app.jdLink        ?? '',
    salaryRange:   app.salaryRange   ?? '',
    interviewDate: toDateInputValue(app.interviewDate),   // ← NEW
  });

  useEffect(() => { setTimeout(() => setMounted(true), 10); }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 250);
  };

  const updateMut = useMutation({
    mutationFn: (payload: Partial<Application>) => updateApplication(app._id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      setEditing(false);
      toast.success('Updated ✓');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteApplication(app._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Deleted');
      handleClose();
    },
    onError: () => toast.error('Delete failed'),
  });

  const handleSave = () => {
    updateMut.mutate({
      ...form,
      interviewDate: form.interviewDate ? new Date(form.interviewDate).toISOString() : undefined,
    });
  };

  const ss       = statusStyle[app.status];
  const inputCls = 'input-base';
  const labelCls = 'block text-xs font-semibold mb-1.5 uppercase tracking-wider';

  // Interview countdown for read-only view
  const interviewInfo = (() => {
    if (!app.interviewDate) return null;
    const days = Math.round(
      (new Date(app.interviewDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000
    );
    const dateStr = new Date(app.interviewDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    let label = dateStr;
    let color = 'var(--col-interview)';
    if (days === 0) { label = `${dateStr} · Today!`; color = 'var(--col-offer)'; }
    else if (days === 1) { label = `${dateStr} · Tomorrow`; color = 'var(--col-phone)'; }
    else if (days > 1) { label = `${dateStr} · in ${days}d`; }
    else if (days < 0) { label = `${dateStr} · passed`; color = 'var(--col-rejected)'; }
    return { label, color };
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background:     mounted ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)',
        backdropFilter: 'blur(8px)',
        transition:     'background 0.25s',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  'var(--shadow-modal)',
          transform:  mounted
            ? 'translateY(0) scale(1)'
            : window.innerWidth < 640 ? 'translateY(100%)' : 'translateY(24px) scale(0.96)',
          opacity:    mounted ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-1 min-w-0 pr-3">
            {editing ? (
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={inputCls}
              />
            ) : (
              <h2 className="text-xl font-bold font-display truncate" style={{ color: 'var(--text-primary)' }}>
                {app.company}
              </h2>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shrink-0"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Role</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as KanbanStatus })}
                  className={inputCls}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* ── Interview date picker ── */}
              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>
                  Interview Date <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>JD Link</label>
                <input value={form.jdLink} onChange={(e) => setForm({ ...form, jdLink: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Salary Range</label>
                <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Role + status */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{app.role}</p>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: ss.bg, color: ss.color }}>
                  {app.status}
                </span>
              </div>

              {/* ── Interview countdown banner ── */}
              {interviewInfo && (
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: `color-mix(in srgb, ${interviewInfo.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${interviewInfo.color} 25%, transparent)` }}
                >
                  <span className="text-base">🗓️</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Interview Date</p>
                    <p className="text-sm font-bold" style={{ color: interviewInfo.color }}>{interviewInfo.label}</p>
                  </div>
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Date Applied</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </p>
                </div>
                {app.salaryRange && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Salary</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--col-offer)' }}>{app.salaryRange}</p>
                  </div>
                )}
                {app.location && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Location</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{app.location}</p>
                  </div>
                )}
                {app.seniority && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Level</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{app.seniority}</p>
                  </div>
                )}
              </div>

              {/* JD link */}
              {app.jdLink && (
                <a
                  href={app.jdLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium transition-all hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View Job Posting
                </a>
              )}

              {/* Skills */}
              {app.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {app.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{app.notes}</p>
                </div>
              )}

              {/* Resume suggestions */}
              {app.resumeSuggestions.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'color-mix(in srgb, var(--col-offer) 6%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, var(--col-offer) 25%, transparent)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--col-offer)' }}>✨ Resume Suggestions</p>
                  {app.resumeSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(s); toast.success('Copied!'); }}
                        className="text-xs font-semibold shrink-0 transition-all hover:scale-105"
                        style={{ color: 'var(--col-offer)' }}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMut.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--col-interview))', color: '#fff', boxShadow: '0 4px 16px var(--accent-glow)' }}
                >
                  {updateMut.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : confirmDelete ? (
              <div
                className="flex-1 rounded-xl p-4 flex flex-col gap-3"
                style={{ background: 'color-mix(in srgb, var(--col-rejected) 8%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, var(--col-rejected) 30%, transparent)' }}
              >
                <p className="text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  Delete <span style={{ color: 'var(--col-rejected)' }}>{app.company}</span>?
                </p>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMut.mutate()}
                    disabled={deleteMut.isPending}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: 'var(--col-rejected)', color: '#fff' }}
                  >
                    {deleteMut.isPending ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'color-mix(in srgb, var(--col-rejected) 12%, transparent)', color: 'var(--col-rejected)', border: '1px solid color-mix(in srgb, var(--col-rejected) 25%, transparent)' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowATS(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--col-interview))', color: '#fff', boxShadow: '0 4px 16px var(--accent-glow)' }}
                >
                  ✨ ATS Score
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showATS && <ATSModal app={app} onClose={() => setShowATS(false)} />}
    </div>
  );
}

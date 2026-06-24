import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication, parseJobDescription } from '../../services/applicationService';
import { KanbanStatus, CreateApplicationPayload } from '../../types';

interface Props {
  onClose: () => void;
}

const STATUSES: KanbanStatus[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

export default function AddApplicationModal({ onClose }: Props) {
  const qc = useQueryClient();
  const [mounted, setMounted] = useState(true);
  const [jdText, setJdText]   = useState('');
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState<CreateApplicationPayload>({
    company:       '',
    role:          '',
    status:        'Applied',
    jdLink:        '',
    salaryRange:   '',
    notes:         '',
    interviewDate: '',     // ← NEW
    skills:        [],
    niceToHaveSkills: [],
    seniority:     '',
    location:      '',
    resumeSuggestions: [],
  });

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 200);
  };

  const createMut = useMutation({
    mutationFn: (payload: CreateApplicationPayload) => createApplication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application added ✓');
      handleClose();
    },
    onError: () => toast.error('Failed to add application'),
  });

  const handleParseJD = async () => {
    if (!jdText.trim()) {
      toast.error('Paste a job description first');
      return;
    }
    setParsing(true);
    try {
      const result = await parseJobDescription(jdText);
      setForm((f) => ({
        ...f,
        company:          result.parsed.company || f.company,
        role:              result.parsed.role || f.role,
        skills:            result.parsed.skills,
        niceToHaveSkills:  result.parsed.niceToHaveSkills,
        seniority:         result.parsed.seniority,
        location:          result.parsed.location,
        resumeSuggestions: result.suggestions,
      }));
      toast.success('Job description parsed ✓');
    } catch {
      toast.error('Failed to parse job description');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = () => {
    if (!form.company?.trim() || !form.role?.trim()) {
      toast.error('Company and role are required');
      return;
    }
    createMut.mutate({
      ...form,
      interviewDate: form.interviewDate ? new Date(form.interviewDate).toISOString() : undefined,
    });
  };

  const inputCls = 'input-base';
  const labelCls = 'block text-xs font-semibold mb-1.5 uppercase tracking-wider';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: mounted ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)', backdropFilter: 'blur(8px)', transition: 'background 0.25s' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  'var(--shadow-modal)',
          transform:  mounted ? 'translateY(0) scale(1)' : window.innerWidth < 640 ? 'translateY(100%)' : 'translateY(24px) scale(0.96)',
          opacity:    mounted ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
        }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
            Add Application
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* AI JD parser */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>✨ Paste Job Description (optional)</p>
            <textarea
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job posting here and let AI auto-fill the form..."
              className={`${inputCls} resize-none`}
            />
            <button
              onClick={handleParseJD}
              disabled={parsing}
              className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {parsing ? 'Parsing...' : '🪄 Auto-fill with AI'}
            </button>
          </div>

          {/* Manual fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Company *</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Role *</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            {/* ── Interview date field ── */}
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
          </div>

          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>JD Link</label>
            <input value={form.jdLink} onChange={(e) => setForm({ ...form, jdLink: e.target.value })} className={inputCls} placeholder="https://..." />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Salary Range</label>
            <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} className={inputCls} placeholder="₹18-30 LPA" />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Parsed skills preview */}
          {(form.skills?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Parsed Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {form.skills?.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={createMut.isPending}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--col-interview))', color: '#fff', boxShadow: '0 4px 20px var(--accent-glow)' }}
          >
            {createMut.isPending ? 'Adding...' : 'Add Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

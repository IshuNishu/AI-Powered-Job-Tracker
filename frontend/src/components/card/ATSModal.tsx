import { useState, useRef } from 'react';
import { Application } from '../../types';
import { scoreResume, ATSResult } from '../../services/applicationService';

interface Props {
  app: Application;
  onClose: () => void;
}

type Stage = 'upload' | 'loading' | 'result';

function ScoreRing({ score }: { score: number }) {
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    score >= 75 ? 'var(--col-offer)' :
    score >= 50 ? 'var(--col-phone)' :
                  'var(--col-rejected)';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeDashoffset={circ / 4}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" fontSize="28" fontWeight="700"
          fill={color} fontFamily="'Space Grotesk', sans-serif">{score}</text>
        <text x="65" y="78" textAnchor="middle" fontSize="11"
          fill="var(--text-muted)" fontFamily="'Plus Jakarta Sans', sans-serif">ATS Score</text>
      </svg>
      <p className="text-xs font-semibold" style={{ color }}>
        {score >= 75 ? '🟢 Strong Match' : score >= 50 ? '🟡 Moderate Match' : '🔴 Weak Match'}
      </p>
    </div>
  );
}

export default function ATSModal({ app, onClose }: Props) {
  const [stage, setStage]       = useState<Stage>('upload');
  const [file, setFile]         = useState<File | null>(null);
  const [result, setResult]     = useState<ATSResult | null>(null);
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError('Only PDF files accepted.'); return; }
    if (f.size > 5 * 1024 * 1024)    { setError('File too large (max 5 MB).'); return; }
    setFile(f);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScore = async () => {
    if (!file) return;
    setStage('loading');
    setError('');
    try {
      const res = await scoreResume(
        file,
        app.role,
        app.skills ?? [],
        app.jdLink ?? '',
        app._id,
      );
      setResult(res);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
      setStage('upload');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  'var(--shadow-modal)',
        }}
      >
        {/* Drag handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              ATS Resume Scorer
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {app.company} · {app.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* ── Upload stage ── */}
          {stage === 'upload' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? 'var(--accent)' : file ? 'var(--col-offer)' : 'var(--border)',
                  background:  dragging
                    ? 'color-mix(in srgb, var(--accent) 6%, transparent)'
                    : file
                      ? 'color-mix(in srgb, var(--col-offer) 6%, transparent)'
                      : 'var(--bg-elevated)',
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {file ? (
                  <>
                    <span className="text-3xl">📄</span>
                    <p className="text-sm font-semibold text-center" style={{ color: 'var(--col-offer)' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">⬆️</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Drop your resume PDF here
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>or click to browse · max 5 MB</p>
                  </>
                )}
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--col-rejected) 10%, transparent)',
                    color: 'var(--col-rejected)',
                    border: '1px solid color-mix(in srgb, var(--col-rejected) 25%, transparent)',
                  }}>
                  ⚠️ {error}
                </div>
              )}

              {app.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Checking against {app.skills.length} required skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.slice(0, 8).map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                        {s}
                      </span>
                    ))}
                    {app.skills.length > 8 && (
                      <span className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        +{app.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleScore}
                disabled={!file}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--col-interview))',
                  color: '#fff',
                  boxShadow: file ? '0 4px 20px var(--accent-glow)' : 'none',
                }}
              >
                ✨ Analyse Resume
              </button>
            </div>
          )}

          {/* ── Loading stage ── */}
          {stage === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-5 py-12">
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0 rounded-full border-4 animate-spin"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Analysing your resume…</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Extracting text · Matching keywords · Scoring</p>
              </div>
            </div>
          )}

          {/* ── Result stage ── */}
          {stage === 'result' && result && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <ScoreRing score={result.score} />
              </div>

              {result.summary && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Summary</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>
                </div>
              )}

              {result.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--col-offer)' }}>
                    ✅ Matched Keywords ({result.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((k) => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'color-mix(in srgb, var(--col-offer) 12%, transparent)', color: 'var(--col-offer)' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--col-rejected)' }}>
                    ❌ Missing Keywords ({result.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'color-mix(in srgb, var(--col-rejected) 12%, transparent)', color: 'var(--col-rejected)' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div className="rounded-xl p-4 space-y-2"
                  style={{
                    background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-elevated))',
                    border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                  }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                    💡 Improvement Tips
                  </p>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setStage('upload'); setFile(null); setResult(null); }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                ↩ Analyse Another Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
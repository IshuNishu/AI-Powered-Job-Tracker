import { Application } from '../types';

export function exportToCSV(applications: Application[]) {
  if (!applications.length) return;

  const headers = [
    'Company',
    'Role',
    'Status',
    'Date Applied',
    'Salary Range',
    'Location',
    'Seniority',
    'JD Link',
    'Skills',
    'Notes',
  ];

  const rows = applications.map((a) => [
    a.company,
    a.role,
    a.status,
    new Date(a.dateApplied).toLocaleDateString(),
    a.salaryRange ?? '',
    a.location ?? '',
    a.seniority ?? '',
    a.jdLink ?? '',
    (a.skills ?? []).join(' | '),
    (a.notes ?? '').replace(/\n/g, ' '),
  ]);

  const escape = (val: string) =>
    `"${String(val).replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

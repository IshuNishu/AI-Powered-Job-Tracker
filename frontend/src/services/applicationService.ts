import api from './api';
import { Application, AuthResponse, CreateApplicationPayload, KanbanStatus, ParseJDResponse } from '../types';

// Auth
export const registerUser = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { email, password }).then((r) => r.data);

export const loginUser = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

// Applications
export const fetchApplications = () =>
  api.get<Application[]>('/applications').then((r) => r.data);

export const createApplication = (payload: CreateApplicationPayload) =>
  api.post<Application>('/applications', payload).then((r) => r.data);

export const updateApplication = (id: string, payload: Partial<Application>) =>
  api.put<Application>(`/applications/${id}`, payload).then((r) => r.data);

export const deleteApplication = (id: string) =>
  api.delete(`/applications/${id}`).then((r) => r.data);

export const updateApplicationStatus = (id: string, status: KanbanStatus) =>
  api.put<Application>(`/applications/${id}`, { status }).then((r) => r.data);

// AI
export const parseJobDescription = (jd: string) =>
  api.post<ParseJDResponse>('/applications/parse-jd', { jd }).then((r) => r.data);

// ATS
export interface ATSResult {
  score:           number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions:     string[];
  summary:         string;
}

export const scoreResume = async (
  file:          File,
  role:          string,
  skills:        string[],
  jdText:        string,
  applicationId: string
): Promise<ATSResult> => {
  const form = new FormData();
  form.append('resume',        file);
  form.append('role',          role);
  form.append('skills',        JSON.stringify(skills));
  form.append('jdText',        jdText);
  form.append('applicationId', applicationId);

  const token = localStorage.getItem('token');
  const res   = await fetch('/api/ats/score', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body:    form,
  });

  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message ?? 'ATS scoring failed');
  }
  return res.json() as Promise<ATSResult>;
};


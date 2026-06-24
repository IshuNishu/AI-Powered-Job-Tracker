export type KanbanStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  interviewDate?: string;
  salaryRange?: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface ParseJDResponse {
  parsed: ParsedJD;
  suggestions: string[];
}

export interface CreateApplicationPayload {
  company: string;
  role: string;
  status?: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied?: string;
  interviewDate?: string;
  salaryRange?: string;
  skills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[];
}

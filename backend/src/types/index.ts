export interface IUser {
  _id: string;
  email: string;
  password: string;
  createdAt: Date;
}

export type KanbanStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface IApplication {
  _id: string;
  userId: string;
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  interviewDate?: Date;
  salaryRange?: string;
  skills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

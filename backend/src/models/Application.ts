import mongoose, { Schema, Document } from 'mongoose';
import { KanbanStatus } from '../types';

export interface IApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  interviewDate?: Date;
  salaryRange?: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company:   { type: String, required: true, trim: true },
    role:      { type: String, required: true, trim: true },
    status: {
      type:    String,
      enum:    ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    jdLink:            { type: String, trim: true },
    notes:             { type: String, trim: true },
    dateApplied:       { type: Date, default: Date.now },
    interviewDate:     { type: Date },               // ← NEW field
    salaryRange:       { type: String, trim: true },
    skills:            [{ type: String }],
    niceToHaveSkills:  [{ type: String }],
    seniority:         { type: String, trim: true },
    location:          { type: String, trim: true },
    resumeSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, status: 1 });

export const Application = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);

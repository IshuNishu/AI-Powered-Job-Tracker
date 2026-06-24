import { Response } from 'express';
import { Application } from '../models/Application';
import { AuthRequest } from '../middleware/auth';
import { KanbanStatus } from '../types';
import * as aiService from '../services/aiService';

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apps = await Application.find({ userId: req.user!.userId }).sort({ updatedAt: -1 });
    res.json(apps);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { company, role, status, jdLink, notes, dateApplied, salaryRange, skills, niceToHaveSkills, seniority, location, resumeSuggestions } = req.body as {
      company?: string; role?: string; status?: KanbanStatus; jdLink?: string;
      notes?: string; dateApplied?: string; salaryRange?: string;
      skills?: string[]; niceToHaveSkills?: string[]; seniority?: string;
      location?: string; resumeSuggestions?: string[];
    };

    if (!company || !role) {
      res.status(400).json({ message: 'Company and role are required' });
      return;
    }

    const app = await Application.create({
      userId: req.user!.userId,
      company, role, status, jdLink, notes,
      dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
      salaryRange, skills: skills ?? [],
      niceToHaveSkills: niceToHaveSkills ?? [],
      seniority, location,
      resumeSuggestions: resumeSuggestions ?? [],
    });

    res.status(201).json(app);
  } catch {
    res.status(500).json({ message: 'Failed to create application' });
  }
};

export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json(app);
  } catch {
    res.status(500).json({ message: 'Failed to update application' });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to delete application' });
  }
};

export const parseJD = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jd } = req.body as { jd?: string };

    console.log("JD received");

    const parsed = await aiService.parseJobDescription(jd!);

    console.log("Parsed success");

    const suggestions = await aiService.generateResumeSuggestions('', [], jd!);

    console.log("Suggestions success");

    res.json({ parsed, suggestions });
  } catch (err) {
    console.error("AI ERROR:", err);

    const message =
      err instanceof Error ? err.message : "AI parsing failed";

    res.status(502).json({ message });
  }
};
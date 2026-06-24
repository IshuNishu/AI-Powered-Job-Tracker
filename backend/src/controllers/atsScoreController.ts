import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { scoreResumeATS } from '../services/aiService';
import { Application } from '../models/Application';

// pdf-parse is a CommonJS module — import safely
// eslint-disable-next-line @typescript-eslint/no-require-imports

export const scoreATS = async (req: Request, res: Response): Promise<void> => {
  try {
    // Multer puts the file on req.file
    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      res.status(400).json({ message: 'No PDF file uploaded' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ message: 'Only PDF files are accepted' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      res.status(400).json({ message: 'File too large (max 5 MB)' });
      return;
    }

    // Extract text from PDF
    const { text: resumeText } = await pdfParse(file.buffer);

    if (!resumeText || resumeText.trim().length < 50) {
      res.status(400).json({ message: 'Could not extract text from PDF. Make sure it is not scanned/image-only.' });
      return;
    }

    // Get job context from body
    const { applicationId, role, skills, jdText } = req.body as {
      applicationId?: string;
      role: string;
      skills: string;      // JSON stringified array
      jdText?: string;
    };

    if (!role) {
      res.status(400).json({ message: 'role is required' });
      return;
    }

    // If applicationId provided, fetch real JD text from DB
    let resolvedJD = jdText ?? '';
    if (applicationId && !resolvedJD) {
      const app = await Application.findById(applicationId);
      if (app && app.jdLink) resolvedJD = app.jdLink;
    }

    const parsedSkills: string[] = (() => {
      try { return JSON.parse(skills ?? '[]') as string[]; }
      catch { return []; }
    })();

    const result = await scoreResumeATS(resumeText, role, parsedSkills, resolvedJD);

    res.json(result);
  } catch (err) {
    console.error('ATS score error:', err);
    res.status(500).json({ message: 'Failed to score resume' });
  }
};
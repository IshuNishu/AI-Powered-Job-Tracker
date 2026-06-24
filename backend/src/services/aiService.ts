import Groq from 'groq-sdk';
import { ParsedJD } from '../types';

const getClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');
  return new Groq({ apiKey });
};

const MODEL = 'llama-3.3-70b-versatile';

export const parseJobDescription = async (jd: string): Promise<ParsedJD> => {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a job description parser. Extract structured data and return ONLY valid JSON:
{
  "company": "company name or empty string",
  "role": "job title",
  "skills": ["required skill 1", "required skill 2"],
  "niceToHaveSkills": ["optional skill 1"],
  "seniority": "Junior | Mid | Senior | Lead | Principal or empty string",
  "location": "city/remote/hybrid or empty string"
}`,
      },
      { role: 'user', content: `Parse this job description:\n\n${jd}` },
    ],
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  const parsed = JSON.parse(content) as ParsedJD;
  return {
    company:          parsed.company          ?? '',
    role:             parsed.role             ?? '',
    skills:           Array.isArray(parsed.skills)           ? parsed.skills           : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
    seniority:        parsed.seniority        ?? '',
    location:         parsed.location         ?? '',
  };
};

export const generateResumeSuggestions = async (
  role: string,
  skills: string[],
  jd: string
): Promise<string[]> => {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a professional resume writer. Generate tailored resume bullet points. Return ONLY valid JSON:
{
  "suggestions": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
}
Each bullet must start with a strong action verb and include metrics where possible.`,
      },
      {
        role: 'user',
        content: `Role: ${role}\nKey Skills: ${skills.join(', ')}\n\nJob Description:\n${jd.slice(0, 1500)}`,
      },
    ],
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  const parsed = JSON.parse(content) as { suggestions: string[] };
  return Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [];
};

// ── ATS Resume Scorer ──────────────────────────────────────────────────────────
export interface ATSResult {
  score:           number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions:     string[];
  summary:         string;
}

export const scoreResumeATS = async (
  resumeText: string,
  role:        string,
  skills:      string[],
  jdText:      string
): Promise<ATSResult> => {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an expert ATS resume analyser. Given a resume and job description, return ONLY valid JSON:
{
  "score": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "suggestions": ["tip 1", "tip 2", "tip 3"],
  "summary": "2-sentence plain-English summary of fit"
}
Scoring: 80-100 strong match, 60-79 moderate, 40-59 weak, 0-39 poor.`,
      },
      {
        role: 'user',
        content: `ROLE: ${role}
REQUIRED SKILLS: ${skills.join(', ')}

JOB DESCRIPTION:
${jdText.slice(0, 1500)}

RESUME TEXT:
${resumeText.slice(0, 3000)}`,
      },
    ],
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  const parsed = JSON.parse(content) as ATSResult;
  return {
    score:           Math.min(100, Math.max(0, parsed.score ?? 0)),
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    suggestions:     Array.isArray(parsed.suggestions)     ? parsed.suggestions.slice(0, 5) : [],
    summary:         parsed.summary ?? '',
  };
};
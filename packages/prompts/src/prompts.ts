/**
 * LLM Prompt Templates for AI Job Search OS
 * 
 * All prompts follow these principles:
 * - Clear role definition
 * - Structured input/output
 * - Factual constraints
 * - Concise outputs
 */

import type { CandidateProfile } from "@ai-job-search/types";
import type { Job } from "@ai-job-search/types";

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const SYSTEM_PROMPT_BASE = `You are an AI assistant helping a job candidate with their job search.
You must be factual, concise, and professional.
Never fabricate information about the candidate's experience, education, or skills.
Only use information explicitly provided in the candidate's profile.
If you're unsure about something, say so rather than making assumptions.`;

export const SYSTEM_PROMPT_MATCHING = `${SYSTEM_PROMPT_BASE}

Your role is to analyze job postings against candidate profiles and provide:
1. A relevance score (0-100)
2. Clear reasoning for the score
3. Identification of skill gaps
4. Detection of hard fails (dealbreakers)
5. A recommendation on whether to apply

Be objective and honest in your assessment. Don't inflate scores.`;

export const SYSTEM_PROMPT_GENERATION = `${SYSTEM_PROMPT_BASE}

Your role is to generate personalized application materials:
1. Cover letters that are concise and tailored to the specific role
2. Intro messages that are professional and engaging
3. Answers to common application questions

Writing style guidelines:
- Be specific and concrete
- Avoid generic phrases like "I'm a perfect fit"
- Highlight relevant experience from the profile
- Match the company's tone when possible
- Keep it concise (cover letters under 250 words unless specified)
- Never lie or exaggerate`;

// ============================================================================
// MATCHING PROMPTS
// ============================================================================

export interface MatchingPromptInput {
  candidate: CandidateProfile;
  job: Job;
  includeReasoning: boolean;
}

export function buildMatchingPrompt(input: MatchingPromptInput): string {
  const { candidate, job, includeReasoning } = input;
  
  return `Analyze this job posting against the candidate's profile.

## Candidate Profile
- Name: ${candidate.firstName} ${candidate.lastName}
- Headline: ${candidate.headline || "N/A"}
- Current Title: ${candidate.currentTitle || "N/A"}
- Years of Experience: ${candidate.yearsOfExperience ?? "N/A"}
- Skills: ${(candidate.skills || []).join(", ") || "None"}
- Preferred Keywords: ${(candidate.preferredKeywords || []).join(", ") || "None"}
- Excluded Keywords: ${(candidate.excludedKeywords || []).join(", ") || "None"}

## Job Posting
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location} (${job.locationType})
- Type: ${job.jobType}
- Seniority: ${job.seniorityLevel || "N/A"}
- Salary: ${job.salaryDisplay || "N/A"}
- Required Skills: ${(job.requiredSkills || []).join(", ") || "None"}
- Preferred Skills: ${(job.preferredSkills || []).join(", ") || "None"}

## Job Description
${job.description}

## Task
Provide a structured analysis with:

1. **Total Score** (0-100): Overall match score
2. **Confidence** (0-1): How confident are you in this score
3. **Component Scores** (0-100 each):
   - Title similarity
   - Skill overlap
   - Seniority match
   - Work mode compatibility
   - Location compatibility
   - Salary compatibility
4. ${includeReasoning ? "**Reasoning**: Brief explanation of the score" : "**Hard Fails**: List any dealbreakers"}
5. **Skill Gaps**: Skills required but missing from candidate profile
6. **Risk Flags**: Any concerns about this posting
7. **Recommendation**: highly_recommended | recommended | neutral | not_recommended | avoid
8. **Recommended Apply Mode**: manual | assisted | auto

Respond in valid JSON format matching this schema:
{
  "totalScore": number,
  "confidence": number,
  "titleScore": number,
  "skillScore": number,
  "seniorityScore": number,
  "workModeScore": number,
  "locationScore": number,
  "salaryScore": number,
  "reasoning": string,
  "hardFailReasons": string[],
  "skillGaps": [{"skill": string, "severity": "minor" | "moderate" | "significant" | "critical"}],
  "riskFlags": [{"type": string, "severity": "low" | "medium" | "high", "message": string}],
  "recommendation": string,
  "recommendedApplyMode": "manual" | "assisted" | "auto"
}`;
}

// ============================================================================
// COVER LETTER GENERATION PROMPTS
// ============================================================================

export interface CoverLetterPromptInput {
  candidate: CandidateProfile;
  job: Job;
  tone: "professional" | "casual" | "enthusiastic" | "concise";
  maxLength?: number;
}

export function buildCoverLetterPrompt(input: CoverLetterPromptInput): string {
  const { candidate, job, tone, maxLength = 250 } = input;
  
  const toneInstructions: Record<string, string> = {
    professional: "Use formal, professional language. Avoid contractions.",
    casual: "Use a friendly, conversational tone while remaining professional.",
    enthusiastic: "Show genuine excitement about the role and company.",
    concise: "Be direct and brief. Get to the point quickly.",
  };
  
  return `Generate a cover letter for this job application.

## Candidate Profile
- Name: ${candidate.firstName} ${candidate.lastName}
- Email: ${candidate.email}
- Headline: ${candidate.headline || "N/A"}
- Current Title: ${candidate.currentTitle || "N/A"}
- Current Company: ${candidate.currentCompany || "N/A"}
- Years of Experience: ${candidate.yearsOfExperience ?? "N/A"}
- Key Skills: ${(candidate.skills || []).slice(0, 8).join(", ") || "None"}

## Relevant Experience
${(candidate.skills || []).length > 0 ? `- Skills: ${candidate.skills.join(", ")}` : ""}

## Job Posting
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${(job.requiredSkills || []).join(", ") || "None"}
- Key Responsibilities: ${job.responsibilities?.slice(0, 3).join("; ") || "N/A"}

## Job Description
${job.description.slice(0, 2000)}${job.description.length > 2000 ? "..." : ""}

## Requirements
- Tone: ${toneInstructions[tone]}
- Maximum length: ${maxLength} words
- Address the candidate as "${candidate.firstName} ${candidate.lastName}"
- Do not include a subject line or salutation beyond "Dear Hiring Manager"
- Focus on 2-3 most relevant skills/experiences
- Mention something specific about the company or role if possible
- End with a call to action

Generate a cover letter that is authentic, specific, and tailored to this role.`;
}

// ============================================================================
// INTRO MESSAGE GENERATION PROMPTS
// ============================================================================

export interface IntroMessagePromptInput {
  candidate: CandidateProfile;
  job: Job;
  platform?: "linkedin" | "email" | "general";
}

export function buildIntroMessagePrompt(input: IntroMessagePromptInput): string {
  const { candidate, job, platform = "general" } = input;
  
  const platformInstructions: Record<string, string> = {
    linkedin: "Keep it under 300 characters. LinkedIn-friendly tone.",
    email: "Keep it under 150 words. Professional email format.",
    general: "Keep it under 100 words. General professional tone.",
  };
  
  return `Generate a short intro message for this job application.

## Candidate
- Name: ${candidate.firstName} ${candidate.lastName}
- Current Title: ${candidate.currentTitle || "N/A"}
- Key Skill: ${(candidate.skills || [])[0] || "relevant experience"}

## Job
- Title: ${job.title}
- Company: ${job.company}

## Requirements
- ${platformInstructions[platform]}
- Hook the reader in the first sentence
- Mention one relevant qualification
- Express genuine interest
- No generic phrases like "I'm excited to apply"

Generate a concise, engaging intro message.`;
}

// ============================================================================
// EMAIL CLASSIFICATION PROMPTS
// ============================================================================

export interface EmailClassificationPromptInput {
  subject: string;
  bodyPreview: string;
  senderName?: string;
  senderAddress: string;
  applicationContext?: {
    jobTitle: string;
    company: string;
    appliedDate: string;
  };
}

export function buildEmailClassificationPrompt(input: EmailClassificationPromptInput): string {
  const { subject, bodyPreview, senderName, senderAddress, applicationContext } = input;
  
  return `Classify this email related to a job application.

## Email Content
- Subject: ${subject}
- From: ${senderName || "Unknown"} <${senderAddress}>
- Preview: ${bodyPreview.slice(0, 500)}

${applicationContext ? `## Application Context
- Job: ${applicationContext.jobTitle} at ${applicationContext.company}
- Applied: ${applicationContext.appliedDate}` : ""}

## Classification Options
Choose ONE of these categories:
- no_action: Automated message, newsletter, or irrelevant
- recruiter_response: Response from recruiter or hiring team
- interview_request: Scheduling or requesting an interview
- rejection: Rejection notification
- additional_info_request: Requesting more information/documents
- test_task: Coding challenge or assignment
- offer: Job offer
- automated_system_message: ATS or system notification
- spam: Spam or phishing attempt

## Response Format
Respond in JSON:
{
  "classification": "one_of_the_above",
  "confidence": 0.0-1.0,
  "summary": "One sentence summary",
  "suggestedNextAction": "What should the candidate do next?",
  "pipelineStatusUpdate": "optional status update suggestion"
}`;
}

// ============================================================================
// INTERVIEW PREPARATION PROMPTS
// ============================================================================

export interface InterviewPrepPromptInput {
  candidate: CandidateProfile;
  job: Job;
  interviewType?: "screening" | "technical" | "behavioral" | "system_design" | "final";
}

export function buildInterviewPrepPrompt(input: InterviewPrepPromptInput): string {
  const { candidate, job, interviewType = "technical" } = input;
  
  return `Help this candidate prepare for a ${interviewType} interview for the "${job.title}" role at ${job.company}.
  
## Candidate Profile
- Headline: ${candidate.headline || "N/A"}
- Experience: ${candidate.yearsOfExperience ?? "N/A"} years
- Top Skills: ${(candidate.skills || []).slice(0, 10).join(", ") || "None"}

## Job Details
- Title: ${job.title}
- Company: ${job.company}
- Key Requirements: ${(job.requiredSkills || []).slice(0, 5).join(", ") || "None"}

## Job Description Preview
${(job.description || "").slice(0, 1000)}...

## Task
Based on the candidate's background and the job requirements, generate:
1. **Top 5 likely interview questions** tailored to this specific role and candidate.
2. **Suggested approach/talking points** for each question, highlighting relevant parts of the candidate's profile.
3. **Specific skills or projects** the candidate should emphasize.
4. **Questions for the candidate to ask** the interviewer.
5. **General tips** for this specific interview type (${interviewType}).

## Response Format
Respond in valid JSON format:
{
  "likelyQuestions": [
    {
      "question": "The question text",
      "reason": "Why this is likely asked",
      "suggestedPoints": ["Key point to mention", "Another relevant point"]
    }
  ],
  "areasToEmphasize": ["Skill/Project 1", "Skill/Project 2"],
  "questionsToAsk": ["Good question 1", "Good question 2"],
  "generalTips": ["Tip 1", "Tip 2"]
}`;
}

// ============================================================================
// PROMPT REGISTRY
// ============================================================================

export const PROMPTS = {
  matching: buildMatchingPrompt,
  coverLetter: buildCoverLetterPrompt,
  introMessage: buildIntroMessagePrompt,
  emailClassification: buildEmailClassificationPrompt,
  interviewPrep: buildInterviewPrepPrompt,
} as const;

export type PromptType = keyof typeof PROMPTS;

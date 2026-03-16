/**
 * Matching domain types
 */

import type { JobId } from "./jobs";
import type { CandidateProfileId, JobType, WorkMode, SeniorityLevel, Timestamps } from "./domain";

export type MatchScoreId = string;
export type MatchReasonId = string;
export type SkillGapId = string;
export type RiskFlagId = string;

// ============================================================================
// MATCH SCORE
// ============================================================================

export interface MatchScore {
  id: MatchScoreId;
  jobId: JobId;
  candidateProfileId: CandidateProfileId;
  
  // Overall score (0-100)
  totalScore: number;
  
  // Confidence in the score (0-1)
  confidence: number;
  
  // Component scores
  titleScore: number;
  skillScore: number;
  seniorityScore: number;
  workModeScore: number;
  locationScore: number;
  salaryScore: number;
  languageScore: number;
  
  // LLM-assisted analysis
  llmReasoning?: string | undefined;
  llmRecommendation?: MatchRecommendation | undefined;
  
  // Hard fails
  hasHardFail: boolean;
  hardFailReasons: HardFailReason[];
  
  // Skill analysis
  skillGaps: SkillGap[];
  skillMatches: SkillMatch[];
  
  // Risk flags
  riskFlags: RiskFlag[];
  
  // Recommendation
  recommendation: MatchRecommendation;
  recommendedApplyMode?: "manual" | "assisted" | "auto" | undefined;
  
  createdAt: Date;
  updatedAt: Date;
}

export type MatchRecommendation = 
  | "highly_recommended"
  | "recommended"
  | "neutral"
  | "not_recommended"
  | "avoid";

export type HardFailReason =
  | "seniority_mismatch"
  | "skill_gap_critical"
  | "location_dealbreaker"
  | "salary_below_minimum"
  | "work_mode_incompatible"
  | "excluded_company"
  | "excluded_keyword"
  | "visa_sponsorship_required"
  | "relocation_required";

// ============================================================================
// SKILL MATCH
// ============================================================================

export interface SkillMatch {
  skill: string;
  category?: string;
  candidateLevel: SkillLevel;
  requiredLevel: SkillLevel;
  isExceeds: boolean;
  isMatch: boolean;
  isGap: boolean;
}

export type SkillLevel = 
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface SkillGap {
  id: SkillGapId;
  skill: string;
  category?: string;
  candidateLevel: SkillLevel | "not_found";
  requiredLevel: SkillLevel;
  gapSeverity: "minor" | "moderate" | "significant" | "critical";
  learnableEstimate?: string; // e.g., "2-4 weeks"
}

// ============================================================================
// RISK FLAG
// ============================================================================

export interface RiskFlag {
  id: RiskFlagId;
  type: RiskFlagType;
  severity: "low" | "medium" | "high";
  message: string;
  details?: Record<string, unknown>;
}

export type RiskFlagType =
  | "job_posting_age" // old posting
  | "salary_transparency" // no salary listed
  | "vague_description" // unclear role
  | "too_many_requirements" // unrealistic expectations
  | "company_reputation" // negative reviews
  | "high_turnover_signal"
  | "scam_likelihood"
  | "duplicate_posting"
  | "ghost_job"; // likely not hiring

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

export interface ScoringWeights {
  title: number; // 0-1
  skills: number;
  seniority: number;
  workMode: number;
  location: number;
  salary: number;
  language: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  title: 0.20,
  skills: 0.30,
  seniority: 0.15,
  workMode: 0.10,
  location: 0.10,
  salary: 0.10,
  language: 0.05,
};

export interface ScoringConfig {
  weights: ScoringWeights;
  hardFailEnabled: boolean;
  llmAssistedEnabled: boolean;
  minConfidenceThreshold: number;
}

// ============================================================================
// DTOs
// ============================================================================

export interface ScoreJobParams {
  jobId: JobId;
  candidateProfileId: CandidateProfileId;
  config?: Partial<ScoringConfig>;
}

export interface MatchScoreSummary {
  jobId: JobId;
  jobTitle: string;
  company: string;
  totalScore: number;
  confidence: number;
  recommendation: MatchRecommendation;
  hasHardFail: boolean;
  createdAt: Date;
}

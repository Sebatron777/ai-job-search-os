/**
 * Core domain types for AI Job Search OS
 * These types are shared across backend, frontend, and workers
 */

// ============================================================================
// IDENTITY DOMAIN
// ============================================================================

export type UserId = string;
export type WorkspaceId = string;
export type MembershipId = string;

export interface User {
  id: UserId;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isEmailVerified: boolean;
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  defaultApprovalMode: ApprovalMode;
  autoSyncEnabled: boolean;
  timezone: string;
  currency: string;
}

export type MembershipRole = "owner" | "admin" | "member" | "viewer";

export interface Membership {
  id: MembershipId;
  userId: UserId;
  workspaceId: WorkspaceId;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
  invitedBy?: UserId;
  invitedAt?: Date;
  acceptedAt: Date | null;
}

export type ConnectedAccountProvider =
  | "gmail"
  | "notion"
  | "google_sheets"
  | "linkedin"
  | "indeed"
  | "glassdoor";

export interface ConnectedAccount {
  id: string;
  userId: UserId;
  provider: ConnectedAccountProvider;
  providerAccountId: string;
  accessToken: string; // encrypted at rest
  refreshToken?: string; // encrypted at rest
  tokenExpiresAt?: Date;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
  status: "active" | "expired" | "revoked" | "error";
  errorMessage?: string;
}

// ============================================================================
// CANDIDATE DOMAIN
// ============================================================================

export type CandidateProfileId = string;
export type JobPreferenceId = string;
export type ResumeAssetId = string;
export type PortfolioLinkId = string;

export interface CandidateProfile {
  id: CandidateProfileId;
  userId: UserId;
  workspaceId: WorkspaceId;
  
  // Personal Info
  firstName: string;
  lastName: string;
  headline: string | null;
  location: string | null;
  timezone: string | null;
  
  // Professional Info
  yearsOfExperience: number | null;
  currentTitle: string | null;
  currentCompany: string | null;
  
  // Contact
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  
  // Skills
  skills: string[];
  
  // Preferences (normalized from JobPreference)
  preferredKeywords: string[];
  excludedKeywords: string[];
  
  // Settings
  voiceTone: VoiceTone;
  autoGenerateCoverLetters: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type VoiceTone = "professional" | "casual" | "enthusiastic" | "concise";

export interface JobPreference {
  id: JobPreferenceId;
  candidateProfileId: CandidateProfileId;
  
  // Job Types
  jobTypes: JobType[];
  
  // Work Arrangement
  workModes: WorkMode[];
  
  // Location
  preferredLocations: LocationPreference[];
  remoteOnly: boolean;
  relocationWilling: boolean;
  
  // Compensation
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency: string;
  salaryPeriod: "hourly" | "monthly" | "yearly";
  
  // Seniority
  seniorityLevels: SeniorityLevel[];
  
  // Industries
  industries: string[];
  
  // Keywords
  preferredKeywords: PreferredKeyword[];
  excludedKeywords: ExcludedKeyword[];
  
  // Companies
  targetCompanies: string[];
  excludedCompanies: string[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type JobType = 
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "apprenticeship";

export type WorkMode = "remote" | "hybrid" | "onsite";

export interface LocationPreference {
  city: string;
  state?: string;
  country: string;
  radiusKm?: number;
}

export type SeniorityLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "principal"
  | "staff"
  | "director"
  | "vp"
  | "c_level";

export interface PreferredKeyword {
  keyword: string;
  weight: number; // 0-1, importance weight
  category?: string;
}

export interface ExcludedKeyword {
  keyword: string;
  reason?: string;
}

export interface ResumeAsset {
  id: ResumeAssetId;
  candidateProfileId: CandidateProfileId;
  
  name: string;
  description: string | null;
  
  // Storage
  storageKey: string; // S3 key
  storageBucket: string;
  mimeType: string;
  sizeBytes: number;
  
  // Metadata
  version: number;
  isDefault: boolean;
  targetedRoles: string[]; // roles this resume is tailored for
  targetedSkills: string[];
  
  // Processing
  parsedContent?: ResumeParsedContent;
  parsingStatus: "pending" | "processing" | "completed" | "failed";
  parsingError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeParsedContent {
  summary: string;
  experience: ParsedExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  certifications: string[];
  languages: string[];
}

export interface ParsedExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface ParsedEducation {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface ParsedSkill {
  name: string;
  category?: string;
  yearsOfExperience?: number;
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface PortfolioLink {
  id: PortfolioLinkId;
  candidateProfileId: CandidateProfileId;
  
  type: "github" | "gitlab" | "behance" | "dribbble" | "personal" | "other";
  url: string;
  title: string;
  description: string | null;
  isPrimary: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// APPROVAL MODES
// ============================================================================

export type ApprovalMode = "manual" | "assisted" | "auto_safe" | "auto_full";

export interface ApprovalModeConfig {
  mode: ApprovalMode;
  
  // Auto-apply restrictions
  maxApplicationsPerDay?: number;
  whitelistedDomains?: string[]; // domains allowed for auto-apply
  minConfidenceScore?: number; // 0-100
  requireHumanReviewFor?: ApplicationType[];
  
  enabled: boolean;
}

export type ApplicationType = "easy_apply" | "standard" | "external";

// ============================================================================
// COMMON TYPES
// ============================================================================

export type UUID = string;

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

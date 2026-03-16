/**
 * Jobs domain types
 */

import type { UUID, Timestamps, JobType, WorkMode, SeniorityLevel } from "./domain";

export type JobId = string;
export type JobSourceId = string;
export type RawJobId = string;
export type CompanyId = string;
export type JobFingerprintId = string;
export type JobSnapshotId = string;

// ============================================================================
// JOB SOURCE
// ============================================================================

export type JobSourceType = 
  | "linkedin"
  | "indeed"
  | "glassdoor"
  | "wellfound"
  | "y_combinator"
  | "remote_ok"
  | "weworkremotely"
  | "company_website"
  | "rss_feed"
  | "api_integration";

export interface JobSource {
  id: JobSourceId;
  workspaceId: string;
  
  name: string;
  type: JobSourceType;
  
  // Configuration
  config: JobSourceConfig;
  
  // Status
  status: "active" | "paused" | "error" | "disabled";
  lastCollectionAt: Date | null;
  lastCollectionStatus?: "success" | "partial" | "failed";
  lastCollectionError?: string;
  
  // Metrics
  totalJobsCollected: number;
  activeJobsCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSourceConfig {
  // Common
  enabled: boolean;
  collectionIntervalMinutes?: number;
  
  // URL-based sources
  baseUrl?: string;
  searchUrl?: string;
  
  // API sources
  apiKey?: string;
  apiEndpoint?: string;
  
  // RSS
  rssFeedUrl?: string;
  
  // Scraping
  selectors?: Record<string, string>;
  
  // Filters
  keywordFilters?: string[];
  locationFilters?: string[];
  
  // Rate limiting
  rateLimitPerMinute?: number;
}

// ============================================================================
// RAW JOB
// ============================================================================

export interface RawJob {
  id: RawJobId;
  sourceId: JobSourceId;
  
  // Original data from source
  sourceJobId: string; // ID from the source system
  rawPayload: Record<string, unknown>;
  
  // Extracted fields (before normalization)
  extractedTitle: string;
  extractedCompany: string;
  extractedLocation: string | null;
  extractedDescription: string | null;
  extractedUrl: string;
  extractedPostedAt: Date | null;
  extractedSalary?: string | null;
  extractedJobType?: string | null;
  
  // Processing
  processingStatus: "pending" | "processing" | "normalized" | "failed";
  processingError?: string;
  normalizedJobId?: JobId;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// COMPANY
// ============================================================================

export interface Company {
  id: CompanyId;
  
  // Identification
  name: string;
  domain?: string;
  
  // Normalized data
  normalizedNames: string[]; // aliases, variations
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  description?: string;
  
  // Metadata
  industry?: string;
  size?: string;
  headquarters?: string;
  foundedYear?: number;
  
  // Flags
  isBlacklisted: boolean;
  blacklistReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// JOB
// ============================================================================

export type JobStatus = 
  | "discovered"
  | "normalized"
  | "scored"
  | "shortlisted"
  | "rejected";


export interface Job {
  id: JobId;
  workspaceId: string;
  sourceId: JobSourceId;
  companyId?: CompanyId;
  
  // Identification
  title: string;
  company: string;
  
  // Normalized URL (canonical)
  canonicalUrl: string;
  sourceUrl: string; // original source URL
  
  // Content
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  
  // Location
  location: string;
  locationType: WorkMode;
  country?: string;
  city?: string;
  state?: string;
  isRemote: boolean;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: "hourly" | "monthly" | "yearly";
  salaryDisplay?: string;
  
  // Classification
  jobType: JobType;
  seniorityLevel?: SeniorityLevel;
  industry?: string;
  
  // Skills
  requiredSkills: string[];
  preferredSkills: string[];
  
  // Metadata
  postedAt: Date;
  expiresAt?: Date;
  applicationDeadline?: Date;
  
  // Status
  status: JobStatus;
  isActive: boolean;
  
  // Fingerprint for deduplication
  fingerprintId?: JobFingerprintId;
  
  // Latest snapshot
  latestSnapshotId?: JobSnapshotId;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // soft delete
}

// ============================================================================
// JOB FINGERPRINT (for deduplication)
// ============================================================================

export interface JobFingerprint {
  id: JobFingerprintId;
  workspaceId: string;
  
  // Components used for fingerprint
  canonicalUrlHash: string;
  sourceJobIdHash: string;
  normalizedTitleHash: string;
  normalizedCompanyHash: string;
  descriptionHash: string; // similarity hash
  locationHash: string;
  postedDateBucket: string; // YYYY-MM-DD bucket
  
  // The computed fingerprint
  fingerprint: string;
  
  // Linked jobs (can have multiple if duplicates found)
  jobIds: JobId[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// JOB SNAPSHOT (for tracking changes)
// ============================================================================

export interface JobSnapshot {
  id: JobSnapshotId;
  jobId: JobId;
  
  // Snapshot of job data at a point in time
  title: string;
  company: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  status: JobStatus;
  
  // Change detection
  changeSummary: string[]; // what changed from previous snapshot
  isMaterialChange: boolean; // triggers re-scoring
  
  createdAt: Date;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateJobSourceDto {
  name: string;
  type: JobSourceType;
  config: JobSourceConfig;
}

export interface UpdateJobSourceDto {
  name?: string;
  config?: Partial<JobSourceConfig>;
  status?: "active" | "paused" | "error" | "disabled";
}

export interface ListJobsFilter {
  status?: JobStatus;
  jobType?: JobType[];
  workMode?: WorkMode[];
  seniorityLevel?: SeniorityLevel[];
  minScore?: number;
  companyIds?: CompanyId[];
  sourceIds?: JobSourceId[];
  postedAfter?: Date;
  postedBefore?: Date;
  searchQuery?: string;
  skills?: string[];
}

export interface JobListParams {
  workspaceId: string;
  filter?: ListJobsFilter;
  page?: number;
  limit?: number;
  sortBy?: keyof Job;
  sortOrder?: "asc" | "desc";
}

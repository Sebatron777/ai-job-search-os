/**
 * Applications domain types
 */

import type { JobId } from "./jobs";
import type { CandidateProfileId, ResumeAssetId, PortfolioLinkId, UserId } from "./domain";
import type { MatchScoreId } from "./matching";

export type ApplicationId = string;
export type ApplicationDraftId = string;
export type AttachmentPackId = string;
export type ApprovalRequestId = string;
export type ApplyAttemptId = string;
export type ApplyArtifactId = string;

// ============================================================================
// APPLICATION STATUS
// ============================================================================

export type ApplicationStatus =
  | "draft"
  | "ready_to_apply"
  | "pending_approval"
  | "approved"
  | "applying"
  | "applied"
  | "apply_failed"
  | "reply_received"
  | "interview"
  | "test_task"
  | "rejected"
  | "offer"
  | "archived";

export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "draft",
  "ready_to_apply",
  "pending_approval",
  "approved",
  "applying",
  "applied",
  "reply_received",
  "interview",
  "test_task",
  "rejected",
  "offer",
  "archived",
];

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "draft",
  "ready_to_apply",
  "pending_approval",
  "approved",
  "applying",
  "applied",
  "reply_received",
  "interview",
  "test_task",
];

// ============================================================================
// APPLICATION
// ============================================================================

export interface Application {
  id: ApplicationId;
  workspaceId: string;
  candidateProfileId: CandidateProfileId;
  jobId: JobId;
  matchScoreId?: MatchScoreId;
  
  // Status tracking
  status: ApplicationStatus;
  statusHistory: ApplicationStatusChange[];
  
  // Application content
  coverLetter?: string;
  introMessage?: string;
  customAnswers?: Record<string, string>;
  
  // Attachments
  attachmentPackId?: AttachmentPackId;
  
  // Submission tracking
  submittedAt?: Date;
  submitMethod?: ApplicationSubmitMethod;
  
  // External tracking
  externalId?: string; // ID from ATS or job board
  externalUrl?: string;
  
  // Metrics
  daysInCurrentStatus: number;
  lastActivityAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationStatusChange {
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  reason?: string;
  changedBy: UserId | "system" | "automation";
  changedAt: Date;
  metadata?: Record<string, unknown>;
}

export type ApplicationSubmitMethod =
  | "manual"
  | "assisted"
  | "auto_safe"
  | "auto_full"
  | "api"
  | "playwright";

// ============================================================================
// APPLICATION DRAFT
// ============================================================================

export interface ApplicationDraft {
  id: ApplicationDraftId;
  workspaceId: string;
  jobId: JobId;
  candidateProfileId: CandidateProfileId;
  
  // Generated content
  coverLetter: string;
  introMessage: string;
  customAnswers: Record<string, string>;
  
  // Selected assets
  resumeAssetId: ResumeAssetId;
  portfolioLinkIds: PortfolioLinkId[];
  
  // Generation metadata
  generationModel: string;
  generationVersion: string;
  generationPrompt?: string;
  
  // Validation
  validationStatus: "pending" | "validated" | "failed";
  validationErrors?: string[];
  factualChecks: FactualCheck[];
  
  // Approval
  approvalStatus: "pending" | "approved" | "rejected" | "revised";
  approvalRequestId?: ApprovalRequestId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FactualCheck {
  check: string;
  passed: boolean;
  details?: string;
}

// ============================================================================
// ATTACHMENT PACK
// ============================================================================

export interface AttachmentPack {
  id: AttachmentPackId;
  workspaceId: string;
  
  // Selected resume
  resumeAssetId: ResumeAssetId;
  resumeStorageKey: string;
  resumeFileName: string;
  
  // Portfolio links
  portfolioLinks: PortfolioLinkAttachment[];
  
  // Additional documents
  additionalDocuments: AdditionalDocument[];
  
  // Packaging
  packFormat: "individual" | "merged_pdf";
  storageKeys: string[]; // all S3 keys in the pack
  
  createdAt: Date;
}

export interface PortfolioLinkAttachment {
  portfolioLinkId: PortfolioLinkId;
  type: "github" | "gitlab" | "behance" | "dribbble" | "personal" | "other";
  url: string;
  title: string;
}

export interface AdditionalDocument {
  name: string;
  description?: string;
  storageKey: string;
  mimeType: string;
  fileType: "cover_letter" | "reference" | "certificate" | "other";
}

// ============================================================================
// APPROVAL REQUEST
// ============================================================================

export type ApprovalDecision = "approved" | "rejected" | "revised";

export interface ApprovalRequest {
  id: ApprovalRequestId;
  applicationDraftId: ApplicationDraftId;
  applicationId?: ApplicationId;
  
  // Request details
  requestedBy: UserId | "automation";
  decision?: ApprovalDecision;
  decidedBy?: UserId;
  decidedAt?: Date;
  decisionReason?: string;
  
  // Revision feedback (if rejected with feedback)
  revisionFeedback?: string;
  revisedDraftId?: ApplicationDraftId;
  
  // Audit
  approvalMode: ApprovalMode;
  autoApprovalReason?: string; // if auto-approved
  
  createdAt: Date;
  expiresAt?: Date;
}

export type ApprovalMode = "manual" | "assisted" | "auto_safe" | "auto_full";

// ============================================================================
// APPLY ATTEMPT
// ============================================================================

export type ApplyAttemptStatus =
  | "pending"
  | "in_progress"
  | "success"
  | "failed"
  | "retry_scheduled";

export interface ApplyAttempt {
  id: ApplyAttemptId;
  applicationId: ApplicationId;
  
  // Attempt details
  attemptNumber: number;
  status: ApplyAttemptStatus;
  
  // Method used
  submitMethod: ApplicationSubmitMethod;
  provider?: string; // e.g., "linkedin", "greenhouse", "lever"
  
  // Execution
  startedAt: Date;
  completedAt?: Date;
  
  // Result
  success: boolean;
  errorMessage?: string;
  errorCode?: string;
  
  // Artifacts
  artifacts: ApplyArtifact[];
  
  // Retry
  retryable: boolean;
  maxRetries: number;
  nextRetryAt?: Date;
  
  createdAt: Date;
}

export interface ApplyArtifact {
  id: ApplyArtifactId;
  type: ApplyArtifactType;
  storageKey?: string; // for screenshots, PDFs
  content?: string; // for extracted text, confirmation numbers
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type ApplyArtifactType =
  | "screenshot_success"
  | "screenshot_error"
  | "confirmation_page"
  | "confirmation_number"
  | "submission_receipt"
  | "error_message"
  | "form_validation_error";

// ============================================================================
// DTOs
// ============================================================================

export interface CreateApplicationDraftDto {
  jobId: JobId;
  candidateProfileId: CandidateProfileId;
  resumeAssetId: ResumeAssetId;
  portfolioLinkIds?: PortfolioLinkId[];
  customAnswers?: Record<string, string>;
}

export interface ApproveApplicationDto {
  approvalRequestId: ApprovalRequestId;
  decision: ApprovalDecision;
  reason?: string;
  revisedDraftId?: ApplicationDraftId;
}

export interface TriggerApplyDto {
  applicationId: ApplicationId;
  submitMethod?: ApplicationSubmitMethod;
}

export interface RetryApplyDto {
  applicationId: ApplicationId;
  applyAttemptId: ApplyAttemptId;
}

export interface ApplicationListParams {
  workspaceId: string;
  status?: ApplicationStatus[];
  candidateProfileId?: CandidateProfileId;
  jobId?: JobId;
  page?: number;
  limit?: number;
  sortBy?: keyof Application;
  sortOrder?: "asc" | "desc";
}

export interface ApplicationFunnelMetrics {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  appliedCount: number;
  replyCount: number;
  interviewCount: number;
  testTaskCount: number;
  offerCount: number;
  rejectedCount: number;
  replyRate: number;
  interviewRate: number;
  offerRate: number;
}

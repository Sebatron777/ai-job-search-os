/**
 * Communications domain types (Email monitoring)
 */

import type { ApplicationId, ApplicationStatus } from "./applications";
import type { UserId } from "./domain";

export type MailboxConnectionId = string;
export type EmailThreadRefId = string;
export type ReplyEventId = string;
export type CommunicationSummaryId = string;

// ============================================================================
// MAILBOX CONNECTION
// ============================================================================

export interface MailboxConnection {
  id: MailboxConnectionId;
  userId: UserId;
  workspaceId: string;
  
  // Provider
  provider: "gmail" | "outlook" | "imap";
  providerAccountId: string;
  
  // Connection status
  status: "connected" | "disconnected" | "error" | "token_expired";
  errorMessage?: string | undefined;
  
  // Sync state
  lastSyncedAt: Date | null;
  syncCursor?: string | undefined; // for incremental sync
  
  // Settings
  syncEnabled: boolean;
  syncIntervalMinutes: number;
  labelFilters?: string[] | undefined; // Gmail labels to monitor
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EMAIL THREAD REF
// ============================================================================

export interface EmailThreadRef {
  id: EmailThreadRefId;
  applicationId: ApplicationId;
  mailboxConnectionId: MailboxConnectionId;
  
  // Thread identification
  threadId: string; // provider thread ID
  messageId: string; // provider message ID
  
  // Participants
  fromAddress: string;
  toAddresses: string[];
  ccAddresses?: string[] | undefined;
  
  // Content
  subject: string;
  snippet: string;
  
  // Classification
  classification: EmailClassification;
  classificationConfidence: number;
  classificationModel?: string | undefined;
  
  // Status
  isRead: boolean;
  isProcessed: boolean;
  requiresAction: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type EmailClassification =
  | "no_action"
  | "recruiter_response"
  | "interview_request"
  | "rejection"
  | "additional_info_request"
  | "test_task"
  | "offer"
  | "automated_system_message"
  | "spam";

// ============================================================================
// REPLY EVENT
// ============================================================================

export interface ReplyEvent {
  id: ReplyEventId;
  applicationId: ApplicationId;
  threadRefId: EmailThreadRefId;
  
  // Event type
  eventType: ReplyEventType;
  
  // Content
  subject: string;
  bodyPreview: string;
  fromName?: string;
  fromAddress: string;
  
  // Classification
  classification: EmailClassification;
  summary?: string | undefined; // AI-generated summary
  suggestedNextAction?: string | undefined;
  
  // Pipeline impact
  pipelineStatusUpdate?: ApplicationStatus | undefined;
  pipelineUpdated: boolean;
  
  // Metadata
  receivedAt: Date;
  processedAt: Date;
  
  createdAt: Date;
}

export type ReplyEventType =
  | "incoming_email"
  | "outgoing_email"
  | "classification_updated"
  | "pipeline_updated"
  | "manual_review";

// ============================================================================
// COMMUNICATION SUMMARY
// ============================================================================

export interface CommunicationSummary {
  id: CommunicationSummaryId;
  applicationId: ApplicationId;
  
  // Summary
  totalEmails: number;
  firstContactAt: Date;
  lastContactAt: Date;
  
  // Classification breakdown
  classifications: Record<EmailClassification, number>;
  
  // Key events
  interviewRequested: boolean;
  interviewRequestedAt?: Date;
  testTaskSent: boolean;
  testTaskSentAt?: Date;
  offerExtended: boolean;
  offerExtendedAt?: Date;
  rejected: boolean;
  rejectedAt?: Date;
  
  // Current state
  currentStage: CommunicationStage;
  isActive: boolean;
  
  // AI summary
  aiSummary?: string;
  
  updatedAt: Date;
}

export type CommunicationStage =
  | "no_contact"
  | "initial_contact"
  | "ongoing_conversation"
  | "interview_scheduled"
  | "test_task_assigned"
  | "offer_discussion"
  | "closed";

// ============================================================================
// DTOs
// ============================================================================

export interface ConnectMailboxDto {
  provider: "gmail" | "outlook" | "imap";
  authCode?: string; // OAuth code
  credentials?: Record<string, string>; // for IMAP
}

export interface ClassifyEmailDto {
  threadRefId: EmailThreadRefId;
  classification: EmailClassification;
  confidence?: number;
  manualOverride?: boolean;
}

export interface EmailListParams {
  applicationId?: ApplicationId;
  classification?: EmailClassification;
  isProcessed?: boolean;
  requiresAction?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "receivedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

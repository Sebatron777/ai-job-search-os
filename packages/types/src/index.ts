/**
 * Shared types barrel export
 */

export type ApprovalMode = "manual" | "assisted" | "auto_safe" | "auto_full";

// ============================================================================
// INTEGRATION TARGETS
// ============================================================================

export interface NotionTarget {
  databaseId: string;
  fieldMapping: Record<string, string>;
  statusMapping: Record<string, string>;
}

export interface SheetTarget {
  spreadsheetId: string;
  sheetName?: string;
  applicationsSheet?: string;
  repliesSheet?: string;
  metricsSheet?: string;
  range?: string;
}

export interface SyncLog {
  id: string;
  workspaceId: string;
  provider: string;
  entityType: string;
  entityId: string;
  status: "success" | "skipped" | "failed";
  error?: string;
  syncedAt: Date;
}

export * from "./domain";
export * from "./jobs";
export type { RawJob } from "./jobs";
export * from "./matching";
export * from "./applications";
export * from "./communications";

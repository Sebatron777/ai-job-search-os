/**
 * Shared utilities for AI Job Search OS
 */

import { createHash } from "crypto";
import { z } from "zod";

// ============================================================================
// HASHING UTILITIES
// ============================================================================

/**
 * Create a SHA256 hash of a string
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Create a fingerprint from multiple fields for deduplication
 */
export function createFingerprint(...fields: string[]): string {
  const combined = fields.join("|");
  return sha256(combined);
}

/**
 * Normalize text for comparison (lowercase, trim, remove extra spaces)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/gi, "");
}

/**
 * Normalize company name for matching
 */
export function normalizeCompanyName(name: string): string {
  return normalizeText(name)
    .replace(/\b(inc|ltd|llc|corp|corporation|limited|company)\b/gi, "")
    .trim();
}

/**
 * Normalize job title for comparison
 */
export function normalizeJobTitle(title: string): string {
  return normalizeText(title)
    .replace(/\b(jr|sr|junior|senior|lead|principal|staff)\b/gi, "")
    .replace(/\b(i|ii|iii|iv|v)\b/gi, "")
    .trim();
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate text to max length without cutting words
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get date bucket for grouping (YYYY-MM-DD)
 */
export function getDateBucket(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

/**
 * Parse date from various formats
 */
export function parseDate(input: string | number | Date): Date | null {
  if (!input) return null;
  
  const date = new Date(input);
  if (isNaN(date.getTime())) return null;
  
  return date;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Calculate similarity between two string arrays (Jaccard index)
 */
export function calculateSimilarity<T>(a: T[], b: T[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Check if arrays have any overlap
 */
export function hasOverlap<T>(a: T[], b: T[]): boolean {
  const setB = new Set(b);
  return a.some(item => setB.has(item));
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object (JSON-safe)
 */
export function deepClone<T extends Record<string, unknown>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]!;
    }
  }
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Zod schema for UUID validation
 */
export const uuidSchema = z.string().uuid();

/**
 * Zod schema for email validation
 */
export const emailSchema = z.string().email();

/**
 * Zod schema for URL validation
 */
export const urlSchema = z.string().url();

/**
 * Zod schema for date validation
 */
export const dateSchema = z.string().datetime().or(z.date());

// ============================================================================
// RESULT TYPE UTILITIES
// ============================================================================

/**
 * Create a success result
 */
export function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function error<E>(error: E): { success: false; error: E } {
  return { success: false, error };
}

/**
 * Safe execution wrapper
 */
export async function safeExecute<T, E = Error>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: E }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e as E };
  }
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
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

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginatedResult<never>["pagination"] {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Paginate an array
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  limit: number
): { items: T[]; pagination: PaginatedResult<T>["pagination"] } {
  const total = array.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const items = array.slice(startIndex, endIndex);
  const pagination = calculatePagination(total, page, limit);
  
  return { items, pagination };
}

/**
 * Сервис управления approval workflow
 * 
 * Поддерживает 4 режима approval:
 * - manual: пользователь подтверждает всё
 * - assisted: AI готовит, человек утверждает
 * - auto_safe: авто-отклик только на whitelisted провайдеров
 * - auto_full: полностью автоматический (за feature flag)
 */

import type {
  Application,
  ApplicationDraft,
  ApprovalRequest,
  ApprovalDecision,
  ApprovalMode,
} from "@ai-job-search/types";

/**
 * Результат проверки возможности auto-apply
 */
export interface AutoApplyCheckResult {
  /** Можно ли применить автоматически */
  canAutoApply: boolean;
  /** Причина если нельзя */
  reason?: string;
  /** Требуется ли ручное подтверждение */
  requiresManualApproval: boolean;
  /** Режим approval */
  approvalMode: ApprovalMode;
}

/**
 * Результат approval проверки
 */
export interface ApprovalCheckResult {
  /** Статус проверки */
  status: "approved" | "rejected" | "pending" | "requires_review";
  /** Причина */
  reason?: string;
  /** Следующий шаг */
  nextAction: string;
}

/**
 * Конфигурация approval сервиса
 */
export interface ApprovalServiceConfig {
  /** Режим approval по умолчанию */
  defaultApprovalMode: ApprovalMode;
  /** Whitelist доменов для auto-apply */
  whitelistedDomains: string[];
  /** Минимальный score для auto-apply */
  minScoreForAuto: number;
  /** Минимальный confidence для auto-apply */
  minConfidenceForAuto: number;
  /** Максимум откликов в день для auto-apply */
  maxApplicationsPerDay: number;
  /** Включить auto_full режим */
  autoFullEnabled: boolean;
}

/**
 * Сервис approval workflow
 */
export class ApprovalService {
  private config: ApprovalServiceConfig;

  constructor(config?: Partial<ApprovalServiceConfig>) {
    this.config = {
      defaultApprovalMode: "assisted",
      whitelistedDomains: [
        "linkedin.com",
        "indeed.com",
        "glassdoor.com",
        "wellfound.com",
      ],
      minScoreForAuto: 80,
      minConfidenceForAuto: 0.85,
      maxApplicationsPerDay: 20,
      autoFullEnabled: false,
      ...config,
    };
  }

  /**
   * Проверить возможность auto-apply
   */
  checkAutoApply(
    draft: ApplicationDraft,
    matchScore?: any,
    applicationsToday: number = 0
  ): AutoApplyCheckResult {
    // Проверка: включен ли auto_full
    if (!this.config.autoFullEnabled) {
      return {
        canAutoApply: false,
        reason: "Auto-full mode is disabled",
        requiresManualApproval: true,
        approvalMode: "manual",
      };
    }

    // Проверка: дневной лимит
    if (applicationsToday >= this.config.maxApplicationsPerDay) {
      return {
        canAutoApply: false,
        reason: `Daily limit reached (${applicationsToday}/${this.config.maxApplicationsPerDay})`,
        requiresManualApproval: true,
        approvalMode: "manual",
      };
    }

    // Проверка: score
    if (matchScore && matchScore.totalScore < this.config.minScoreForAuto) {
      return {
        canAutoApply: false,
        reason: `Score too low (${matchScore.totalScore} < ${this.config.minScoreForAuto})`,
        requiresManualApproval: true,
        approvalMode: "assisted",
      };
    }

    // Проверка: confidence
    if (matchScore && matchScore.confidence < this.config.minConfidenceForAuto) {
      return {
        canAutoApply: false,
        reason: `Confidence too low (${matchScore.confidence} < ${this.config.minConfidenceForAuto})`,
        requiresManualApproval: true,
        approvalMode: "assisted",
      };
    }

    // Проверка: domain whitelist
    const domain = this.extractDomain(draft.job?.canonicalUrl || "");
    if (domain && !this.isWhitelisted(domain)) {
      return {
        canAutoApply: false,
        reason: `Domain not whitelisted (${domain})`,
        requiresManualApproval: true,
        approvalMode: "assisted",
      };
    }

    // Проверка: validation errors
    if (draft.validationErrors && draft.validationErrors.length > 0) {
      return {
        canAutoApply: false,
        reason: "Draft has validation errors",
        requiresManualApproval: true,
        approvalMode: "manual",
      };
    }

    // Проверка: factual checks
    const failedChecks = draft.factualChecks?.filter((c: any) => !c.passed) || [];
    if (failedChecks.length > 0) {
      return {
        canAutoApply: false,
        reason: "Factual checks failed",
        requiresManualApproval: true,
        approvalMode: "manual",
      };
    }

    // Все проверки пройдены
    return {
      canAutoApply: true,
      requiresManualApproval: false,
      approvalMode: "auto_full",
    };
  }

  /**
   * Создать approval request
   */
  createApprovalRequest(
    draft: ApplicationDraft,
    requestedBy: string,
    autoCheckResult?: AutoApplyCheckResult
  ): Partial<ApprovalRequest> {
    const approvalMode = autoCheckResult?.approvalMode || this.config.defaultApprovalMode;

    // Auto-approval если возможно
    const shouldAutoApprove = autoCheckResult?.canAutoApply && !autoCheckResult.requiresManualApproval;

    return {
      applicationDraftId: draft.id,
      requestedBy,
      approvalMode,
      decision: shouldAutoApprove ? "approved" : undefined,
      autoApprovalReason: shouldAutoApprove
        ? `Auto-approved: score=${draft.validationStatus}, mode=${approvalMode}`
        : undefined,
      expiresAt: this.calculateExpiryDate(approvalMode),
    };
  }

  /**
   * Обработать решение по approval request
   */
  processApprovalDecision(
    request: ApprovalRequest,
    decision: ApprovalDecision,
    decidedBy: string,
    revisionFeedback?: string
  ): ApprovalCheckResult {
    // Проверка: уже есть решение
    if (request.decision) {
      return {
        status: request.decision,
        reason: "Already decided",
        nextAction: "Proceed with application",
      };
    }

    // Проверка: истёк ли
    if (request.expiresAt && new Date() > request.expiresAt) {
      return {
        status: "rejected",
        reason: "Approval request expired",
        nextAction: "Create new approval request",
      };
    }

    // Обработка решения
    switch (decision) {
      case "approved":
        return {
          status: "approved",
          reason: "Approved by " + decidedBy,
          nextAction: "Proceed with application submission",
        };

      case "rejected":
        return {
          status: "rejected",
          reason: revisionFeedback || "Rejected by " + decidedBy,
          nextAction: "Revise draft or skip application",
        };

      case "revised":
        return {
          status: "pending",
          reason: "Requires revision",
          nextAction: "Update draft and resubmit",
        };

      default:
        return {
          status: "pending",
          reason: "Awaiting decision",
          nextAction: "Wait for approval",
        };
    }
  }

  /**
   * Определить рекомендуемый режим approval
   */
  recommendApprovalMode(
    matchScore?: any,
    jobUrl?: string,
    draftValidationStatus?: string
  ): ApprovalMode {
    // Если есть hard fails - только manual
    if (matchScore?.hasHardFail) {
      return "manual";
    }

    // Если низкий score - manual
    if (matchScore && matchScore.totalScore < 50) {
      return "manual";
    }

    // Если высокий score и confidence - auto_safe
    if (
      matchScore &&
      matchScore.totalScore >= this.config.minScoreForAuto &&
      matchScore.confidence >= this.config.minConfidenceForAuto
    ) {
      const domain = this.extractDomain(jobUrl || "");
      if (domain && this.isWhitelisted(domain)) {
        return "auto_safe";
      }
    }

    // По умолчанию assisted
    return "assisted";
  }

  /**
   * Проверить лимиты перед отправкой
   */
  checkSubmissionLimits(
    applicationsToday: number,
    lastApplicationAt?: Date
  ): { canSubmit: boolean; reason?: string } {
    // Проверка дневного лимита
    if (applicationsToday >= this.config.maxApplicationsPerDay) {
      return {
        canSubmit: false,
        reason: `Daily application limit reached (${applicationsToday}/${this.config.maxApplicationsPerDay})`,
      };
    }

    // Проверка: не слишком ли часто отправляем (rate limiting)
    if (lastApplicationAt) {
      const minutesSinceLast =
        (Date.now() - lastApplicationAt.getTime()) / 1000 / 60;
      if (minutesSinceLast < 2) {
        return {
          canSubmit: false,
          reason: `Please wait ${Math.ceil(2 - minutesSinceLast)} minutes before next application`,
        };
      }
    }

    return { canSubmit: true };
  }

  /**
   * Извлечь домен из URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  /**
   * Проверка: whitelist домен
   */
  private isWhitelisted(domain: string): boolean {
    return this.config.whitelistedDomains.some((d) =>
      domain.toLowerCase().includes(d.toLowerCase())
    );
  }

  /**
   * Рассчитать время истечения approval request
   */
  private calculateExpiryDate(approvalMode: ApprovalMode): Date {
    const expiryHours = {
      manual: 72, // 3 дня
      assisted: 48, // 2 дня
      auto_safe: 24, // 1 день
      auto_full: 12, // 12 часов
    };

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + (expiryHours[approvalMode] || 24));
    return expiry;
  }
}

/**
 * Audit log entry для approval действий
 */
export interface ApprovalAuditLog {
  /** ID approval request */
  approvalRequestId: string;
  /** Действие */
  action: "created" | "approved" | "rejected" | "revised" | "expired";
  /** Кто выполнил */
  userId: string;
  /** Причина */
  reason?: string;
  /** Метаданные */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
}

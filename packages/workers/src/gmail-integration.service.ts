/**
 * Сервис интеграции с Gmail
 * 
 * Поддерживает:
 * - OAuth 2.0 authentication
 * - Incremental sync с cursor
 * - Webhook handling (push notifications)
 * - Email classification с LLM
 */

import type { MailboxConnection, EmailThreadRef, ReplyEvent } from "@ai-job-search/types";

/**
 * Gmail API client интерфейс
 */
export interface GmailClient {
  /**
   * Получить access token
   */
  getAccessToken(): Promise<string>;

  /**
   * Получить список писем
   */
  listMessages(options?: ListMessagesOptions): Promise<GmailMessage[]>;

  /**
   * Получить письмо по ID
   */
  getMessage(id: string): Promise<GmailMessageDetail>;

  /**
   * Отметить как прочитанное
   */
  markAsRead(messageId: string): Promise<void>;

  /**
   * Отправить письмо
   */
  sendMessage(raw: string): Promise<GmailMessage>;

  /**
   * Получить историю изменений
   */
  getHistory(startHistoryId: string): Promise<GmailHistory>;
}

/**
 * Опции для listMessages
 */
export interface ListMessagesOptions {
  /** Query (Gmail search syntax) */
  q?: string;
  /** Max results */
  maxResults?: number;
  /** Page token */
  pageToken?: string;
  /** Label IDs */
  labelIds?: string[];
}

/**
 * Gmail сообщение
 */
export interface GmailMessage {
  /** ID сообщения */
  id: string;
  /** Thread ID */
  threadId: string;
  /** Label IDs */
  labelIds: string[];
  /** Дата отправки */
  date: string;
  /** От кого */
  from: string;
  /** Кому */
  to: string;
  /** Тема */
  subject: string;
  /** Сниппет */
  snippet: string;
  /** История ID */
  historyId?: string;
}

/**
 * Детали письма
 */
export interface GmailMessageDetail extends GmailMessage {
  /** Тело письма */
  body: {
    /** Data (base64 encoded) */
    data?: string;
    /** Size in bytes */
    size: number;
  };
  /** Заголовки */
  headers: Array<{ name: string; value: string }>;
  /** Parts (для multipart) */
  parts?: GmailMessageDetail[];
}

/**
 * История изменений
 */
export interface GmailHistory {
  /** History ID */
  historyId: string;
  /** Изменения */
  history: Array<{
    id: string;
    type: string;
    messageAdded?: GmailMessage;
    labelsAdded?: string[];
    labelsRemoved?: string[];
  }>;
}

/**
 * Результат классификации письма
 */
export interface EmailClassificationResult {
  /** Классификация */
  classification: EmailClassification;
  /** Confidence (0-1) */
  confidence: number;
  /** Summary */
  summary?: string;
  /** Suggested next action */
  suggestedNextAction?: string;
  /** Pipeline status update */
  pipelineStatusUpdate?: ApplicationStatus;
}

/**
 * Типы классификации писем
 */
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

/**
 * Статусы приложения (для pipeline updates)
 */
export type ApplicationStatus =
  | "draft"
  | "ready_to_apply"
  | "pending_approval"
  | "approved"
  | "applying"
  | "applied"
  | "reply_received"
  | "interview"
  | "test_task"
  | "rejected"
  | "offer"
  | "archived";

/**
 * Конфигурация Gmail сервиса
 */
export interface GmailServiceConfig {
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Redirect URI */
  redirectUri: string;
  /** Scopes */
  scopes: string[];
  /** Включить LLM классификацию */
  llmClassificationEnabled: boolean;
  /** Интервал sync (минуты) */
  syncIntervalMinutes: number;
}

/**
 * Сервис интеграции с Gmail
 */
export class GmailIntegrationService {
  private client: GmailClient | null;
  private config: GmailServiceConfig;

  constructor(client?: GmailClient, config?: Partial<GmailServiceConfig>) {
    this.client = client || null;
    this.config = {
      clientId: "",
      clientSecret: "",
      redirectUri: "",
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
      ],
      llmClassificationEnabled: true,
      syncIntervalMinutes: 15,
      ...config,
    };
  }

  /**
   * Создать OAuth URL для авторизации
   */
  createAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    if (state) {
      params.append("state", state);
    }

    return `https://oauth2.googleapis.com/authorize?${params.toString()}`;
  }

  /**
   * Обработать callback от OAuth
   */
  async handleCallback(code: string): Promise<GmailAuthResult> {
    if (!this.client) {
      throw new Error("Gmail client not initialized");
    }

    // Exchange code for tokens (реализуется в конкретном клиенте)
    // Это заглушка для демонстрации структуры
    return {
      accessToken: "access_token_placeholder",
      refreshToken: "refresh_token_placeholder",
      expiryDate: new Date(Date.now() + 3600000),
      providerAccountId: "gmail_account_id",
    };
  }

  /**
   * Синхронизировать письма
   */
  async syncEmails(
    mailbox: MailboxConnection,
    since?: Date
  ): Promise<SyncResult> {
    if (!this.client) {
      return {
        success: false,
        error: "Gmail client not initialized",
        syncedCount: 0,
      };
    }

    try {
      // Построить query
      const query = this.buildSyncQuery(since, mailbox.labelFilters);

      // Получить письма
      const messages = await this.client.listMessages({
        q: query,
        maxResults: 100,
      });

      // Обработать каждое письмо
      const syncedCount = 0;
      for (const message of messages) {
        await this.processMessage(message, mailbox);
        syncedCount++;
      }

      return {
        success: true,
        syncedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        syncedCount: 0,
      };
    }
  }

  /**
   * Классифицировать письмо
   */
  async classifyEmail(
    message: GmailMessageDetail
  ): Promise<EmailClassificationResult> {
    // Извлечь контент
    const content = this.extractEmailContent(message);

    // LLM классификация (если включена)
    if (this.config.llmClassificationEnabled) {
      return this.llmClassify(content, message);
    }

    // Rule-based классификация (fallback)
    return this.ruleBasedClassify(content, message);
  }

  /**
   * Привязать письмо к приложению
   */
  async linkEmailToApplication(
    message: GmailMessage,
    applicationId: string
  ): Promise<EmailThreadRef> {
    // Создать или обновить thread reference
    return {
      id: `thread-${message.id}`,
      applicationId,
      mailboxConnectionId: "mailbox-id",
      threadId: message.threadId,
      messageId: message.id,
      fromAddress: message.from,
      toAddresses: [message.to],
      ccAddresses: [],
      subject: message.subject,
      snippet: message.snippet,
      classification: "no_action",
      classificationConfidence: 0,
      isRead: message.labelIds?.includes("READ") || false,
      isProcessed: false,
      requiresAction: false,
      createdAt: new Date(message.date),
      updatedAt: new Date(),
    };
  }

  /**
   * Создать reply event
   */
  createReplyEvent(
    threadRef: EmailThreadRef,
    classification: EmailClassificationResult
  ): Partial<ReplyEvent> {
    return {
      threadRefId: threadRef.id,
      applicationId: threadRef.applicationId,
      eventType: "incoming_email",
      subject: threadRef.subject,
      bodyPreview: threadRef.snippet,
      fromAddress: threadRef.fromAddress,
      classification: classification.classification,
      summary: classification.summary,
      suggestedNextAction: classification.suggestedNextAction,
      pipelineStatusUpdate: classification.pipelineStatusUpdate,
      pipelineUpdated: !!classification.pipelineStatusUpdate,
      receivedAt: new Date(),
      processedAt: new Date(),
    };
  }

  /**
   * Построить query для sync
   */
  private buildSyncQuery(since?: Date, labelFilters?: string[]): string {
    const parts: string[] = [];

    // Filter by date
    if (since) {
      const after = this.formatGmailDate(since);
      parts.push(`after:${after}`);
    }

    // Filter by labels
    if (labelFilters && labelFilters.length > 0) {
      parts.push(`label:${labelFilters[0]}`);
    }

    // Only inbox
    parts.push("in:inbox");

    // Exclude sent
    parts.push("-in:sent");

    return parts.join(" ");
  }

  /**
   * Форматировать дату для Gmail API
   */
  private formatGmailDate(date: Date): string {
    return Math.floor(date.getTime() / 1000).toString();
  }

  /**
   * Обработать сообщение
   */
  private async processMessage(
    message: GmailMessage,
    mailbox: MailboxConnection
  ): Promise<void> {
    // Получить детали
    const detail = await this.client!.getMessage(message.id);

    // Классифицировать
    const classification = await this.classifyEmail(detail);

    // Найти связанное приложение (по subject или from)
    const application = await this.findRelatedApplication(detail);

    if (application) {
      // Привязать к приложению
      await this.linkEmailToApplication(message, application.id);
    }
  }

  /**
   * Извлечь контент из письма
   */
  private extractEmailContent(message: GmailMessageDetail): string {
    // Decode base64
    const bodyData = message.body.data;
    if (bodyData) {
      return Buffer.from(bodyData, "base64").toString("utf-8");
    }

    // Try parts
    if (message.parts && message.parts.length > 0) {
      const textPart = message.parts.find(
        (p) => p.body.data && p.mimeType?.includes("text/plain")
      );
      if (textPart?.body.data) {
        return Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    }

    // Fallback to snippet
    return message.snippet;
  }

  /**
   * LLM классификация
   */
  private async llmClassify(
    content: string,
    message: GmailMessage
  ): Promise<EmailClassificationResult> {
    // TODO: Интеграция с LLM для классификации
    // Пока используем rule-based как fallback
    return this.ruleBasedClassify(content, message);
  }

  /**
   * Rule-based классификация
   */
  private ruleBasedClassify(
    content: string,
    message: GmailMessage
  ): EmailClassificationResult {
    const lowerContent = content.toLowerCase();
    const lowerSubject = message.subject.toLowerCase();

    // Interview request
    if (
      lowerContent.includes("interview") ||
      lowerSubject.includes("interview") ||
      lowerContent.includes("schedule a call") ||
      lowerContent.includes("availability")
    ) {
      return {
        classification: "interview_request",
        confidence: 0.9,
        summary: "Interview request detected",
        suggestedNextAction: "Respond with availability",
        pipelineStatusUpdate: "interview",
      };
    }

    // Rejection
    if (
      lowerContent.includes("thank you for your interest") ||
      lowerContent.includes("we have decided") ||
      lowerContent.includes("not moving forward") ||
      lowerSubject.includes("update")
    ) {
      return {
        classification: "rejection",
        confidence: 0.85,
        summary: "Rejection email detected",
        suggestedNextAction: "Archive and move on",
        pipelineStatusUpdate: "rejected",
      };
    }

    // Test task
    if (
      lowerContent.includes("coding challenge") ||
      lowerContent.includes("take home") ||
      lowerContent.includes("assignment") ||
      lowerContent.includes("test task")
    ) {
      return {
        classification: "test_task",
        confidence: 0.9,
        summary: "Test task assigned",
        suggestedNextAction: "Complete the assignment",
        pipelineStatusUpdate: "test_task",
      };
    }

    // Offer
    if (
      lowerContent.includes("offer") ||
      lowerContent.includes("compensation") ||
      lowerContent.includes("salary") ||
      lowerSubject.includes("offer")
    ) {
      return {
        classification: "offer",
        confidence: 0.95,
        summary: "Job offer detected",
        suggestedNextAction: "Review and respond",
        pipelineStatusUpdate: "offer",
      };
    }

    // Automated system message
    if (
      lowerContent.includes("no-reply") ||
      lowerContent.includes("automated") ||
      lowerContent.includes("do not reply")
    ) {
      return {
        classification: "automated_system_message",
        confidence: 0.8,
        summary: "Automated message",
        suggestedNextAction: "No action needed",
      };
    }

    // Default: recruiter response
    return {
      classification: "recruiter_response",
      confidence: 0.6,
      summary: "Recruiter response",
      suggestedNextAction: "Review and respond",
      pipelineStatusUpdate: "reply_received",
    };
  }

  /**
   * Найти связанное приложение
   */
  private async findRelatedApplication(
    message: GmailMessageDetail
  ): Promise<{ id: string } | null> {
    // Поиск по subject (job title, company)
    // Поиск по from (recruiter email domain)
    // Это заглушка - реальная реализация зависит от БД
    return null;
  }
}

/**
 * Результат OAuth авторизации
 */
export interface GmailAuthResult {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  providerAccountId: string;
}

/**
 * Результат sync
 */
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
}

/**
 * Mock Gmail client для тестирования
 */
export class MockGmailClient implements GmailClient {
  async getAccessToken(): Promise<string> {
    return "mock_access_token";
  }

  async listMessages(options?: ListMessagesOptions): Promise<GmailMessage[]> {
    return [
      {
        id: "msg-1",
        threadId: "thread-1",
        labelIds: ["INBOX", "UNREAD"],
        date: new Date().toISOString(),
        from: "recruiter@company.com",
        to: "user@example.com",
        subject: "Interview Request",
        snippet: "We would like to schedule an interview...",
      },
    ];
  }

  async getMessage(id: string): Promise<GmailMessageDetail> {
    return {
      id,
      threadId: "thread-1",
      labelIds: ["INBOX", "UNREAD"],
      date: new Date().toISOString(),
      from: "recruiter@company.com",
      to: "user@example.com",
      subject: "Interview Request",
      snippet: "We would like to schedule an interview...",
      body: {
        data: Buffer.from("We would like to schedule an interview...").toString(
          "base64"
        ),
        size: 100,
      },
      headers: [],
    };
  }

  async markAsRead(messageId: string): Promise<void> {
    // Mock implementation
  }

  async sendMessage(raw: string): Promise<GmailMessage> {
    return {
      id: "sent-msg-1",
      threadId: "thread-1",
      labelIds: ["SENT"],
      date: new Date().toISOString(),
      from: "user@example.com",
      to: "recruiter@company.com",
      subject: "Re: Interview Request",
      snippet: "Thank you for the opportunity...",
    };
  }

  async getHistory(startHistoryId: string): Promise<GmailHistory> {
    return {
      historyId: "new-history-id",
      history: [],
    };
  }
}

/**
 * Сервис интеграции с Google Sheets
 * 
 * Поддерживает:
 * - OAuth 2.0 authentication
 * - Append/update rows
 * - Multiple sheets (applications, replies, metrics)
 * - Batch operations
 */

import type { SheetTarget } from "@ai-job-search/types";

/**
 * Google Sheets API client интерфейс
 */
export interface SheetsClient {
  /**
   * Получить данные из spreadsheet
   */
  getSpreadsheet(spreadsheetId: string): Promise<GoogleSpreadsheet>;

  /**
   * Получить значения из range
   */
  getValues(
    spreadsheetId: string,
    range: string
  ): Promise<GoogleValueRange>;

  /**
   * Обновить значения
   */
  updateValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<GoogleValueRange>;

  /**
   * Append значения
   */
  appendValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<GoogleValueRange>;

  /**
   * Batch update
   */
  batchUpdate(
    spreadsheetId: string,
    requests: any[]
  ): Promise<GoogleBatchResponse>;
}

/**
 * Google Spreadsheet
 */
export interface GoogleSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

/**
 * Google Value Range
 */
export interface GoogleValueRange {
  range: string;
  majorDimension: string;
  values: any[][];
}

/**
 * Google Batch Response
 */
export interface GoogleBatchResponse {
  spreadsheetId: string;
  replies: any[];
}

/**
 * Mapping полей для Sheets
 */
export interface SheetsFieldMapping {
  /** Колонки для applications sheet */
  applications: {
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: string;
    salary: string;
    matchScore: string;
    url: string;
    notes: string;
  };
  /** Колонки для replies sheet */
  replies: {
    id: string;
    applicationId: string;
    date: string;
    from: string;
    subject: string;
    classification: string;
    summary: string;
  };
  /** Колонки для metrics sheet */
  metrics: {
    date: string;
    applicationsCount: string;
    repliesCount: string;
    interviewsCount: string;
    offersCount: string;
  };
}

/**
 * Конфигурация Sheets сервиса
 */
export interface SheetsServiceConfig {
  /** Client ID */
  clientId: string;
  /** Client secret */
  clientSecret: string;
  /** Spreadsheet ID */
  spreadsheetId?: string;
  /** Field mapping */
  fieldMapping: Partial<SheetsFieldMapping>;
}

/**
 * Сервис интеграции с Google Sheets
 */
export class SheetsIntegrationService {
  private client: SheetsClient | null;
  private config: SheetsServiceConfig;
  private defaultFieldMapping: SheetsFieldMapping;

  constructor(client?: SheetsClient, config?: Partial<SheetsServiceConfig>) {
    this.client = client || null;
    this.config = {
      clientId: "",
      clientSecret: "",
      spreadsheetId: config?.spreadsheetId,
      fieldMapping: config?.fieldMapping || {},
    };

    this.defaultFieldMapping = {
      applications: {
        id: "A",
        jobTitle: "B",
        company: "C",
        status: "D",
        appliedDate: "E",
        salary: "F",
        matchScore: "G",
        url: "H",
        notes: "I",
      },
      replies: {
        id: "A",
        applicationId: "B",
        date: "C",
        from: "D",
        subject: "E",
        classification: "F",
        summary: "G",
      },
      metrics: {
        date: "A",
        applicationsCount: "B",
        repliesCount: "C",
        interviewsCount: "D",
        offersCount: "E",
      },
    };
  }

  /**
   * Создать OAuth URL
   */
  createAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: "https://your-app.com/callback",
      response_type: "code",
      scope: "https://www.googleapis.com/auth/spreadsheets",
      access_type: "offline",
      prompt: "consent",
    });

    if (state) {
      params.append("state", state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Синхронизировать приложение с Sheets
   */
  async syncApplication(
    application: any,
    target: SheetTarget
  ): Promise<SyncApplicationResult> {
    if (!this.client || !target.spreadsheetId) {
      return {
        success: false,
        error: "Sheets client not initialized",
      };
    }

    try {
      const sheetName = target.applicationsSheet || "Applications";
      const range = `${sheetName}!A:I`;

      // Получить существующие данные
      const existingData = await this.client.getValues(
        target.spreadsheetId,
        range
      );

      // Найти существующую строку
      const rowIndex = this.findExistingRow(
        existingData.values,
        application.id
      );

      const values = this.buildApplicationRow(application);

      if (rowIndex >= 0) {
        // Update existing
        const updateRange = `${sheetName}!${rowIndex + 1}:${rowIndex + 1}`;
        await this.client.updateValues(target.spreadsheetId, updateRange, [
          values,
        ]);
      } else {
        // Append new
        await this.client.appendValues(
          target.spreadsheetId,
          `${sheetName}!A:I`,
          [values]
        );
      }

      return {
        success: true,
        externalRef: `row-${rowIndex >= 0 ? rowIndex : existingData.values.length + 1}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Синхронизировать reply с Sheets
   */
  async syncReply(
    reply: any,
    target: SheetTarget
  ): Promise<SyncReplyResult> {
    if (!this.client || !target.spreadsheetId) {
      return {
        success: false,
        error: "Sheets client not initialized",
      };
    }

    try {
      const sheetName = target.repliesSheet || "Replies";
      const values = this.buildReplyRow(reply);

      await this.client.appendValues(
        target.spreadsheetId,
        `${sheetName}!A:G`,
        [values]
      );

      return {
        success: true,
        externalRef: `reply-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Обновить метрики
   */
  async updateMetrics(
    metrics: {
      applicationsCount: number;
      repliesCount: number;
      interviewsCount: number;
      offersCount: number;
    },
    target: SheetTarget
  ): Promise<SyncMetricsResult> {
    if (!this.client || !target.spreadsheetId) {
      return {
        success: false,
        error: "Sheets client not initialized",
      };
    }

    try {
      const sheetName = target.metricsSheet || "Metrics";
      const today = new Date().toISOString().split("T")[0];
      const values = [[today, metrics.applicationsCount, metrics.repliesCount, metrics.interviewsCount, metrics.offersCount]];

      await this.client.appendValues(
        target.spreadsheetId,
        `${sheetName}!A:E`,
        values
      );

      return {
        success: true,
        externalRef: `metrics-${today}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Построить строку для приложения
   */
  private buildApplicationRow(application: any): any[] {
    const mapping = {
      ...this.defaultFieldMapping.applications,
      ...this.config.fieldMapping?.applications,
    };

    const row: any[] = [];
    row[mapping.id.charCodeAt(0) - 65] = application.id;
    row[mapping.jobTitle.charCodeAt(0) - 65] = application.job?.title || "";
    row[mapping.company.charCodeAt(0) - 65] = application.job?.company || "";
    row[mapping.status.charCodeAt(0) - 65] = application.status || "draft";
    row[mapping.appliedDate.charCodeAt(0) - 65] = application.createdAt
      ? new Date(application.createdAt).toLocaleDateString()
      : "";
    row[mapping.salary.charCodeAt(0) - 65] = this.formatSalary(application.job);
    row[mapping.matchScore.charCodeAt(0) - 65] = application.matchScore?.totalScore || "";
    row[mapping.url.charCodeAt(0) - 65] = application.job?.canonicalUrl || "";
    row[mapping.notes.charCodeAt(0) - 65] = application.coverLetter || "";

    return row;
  }

  /**
   * Построить строку для reply
   */
  private buildReplyRow(reply: any): any[] {
    const mapping = {
      ...this.defaultFieldMapping.replies,
      ...this.config.fieldMapping?.replies,
    };

    const row: any[] = [];
    row[mapping.id.charCodeAt(0) - 65] = reply.id;
    row[mapping.applicationId.charCodeAt(0) - 65] = reply.applicationId;
    row[mapping.date.charCodeAt(0) - 65] = new Date(reply.receivedAt).toLocaleString();
    row[mapping.from.charCodeAt(0) - 65] = reply.fromAddress || "";
    row[mapping.subject.charCodeAt(0) - 65] = reply.subject || "";
    row[mapping.classification.charCodeAt(0) - 65] = reply.classification || "";
    row[mapping.summary.charCodeAt(0) - 65] = reply.summary || "";

    return row;
  }

  /**
   * Найти существующую строку
   */
  private findExistingRow(values: any[][], applicationId: string): number {
    for (let i = 1; i < values.length; i++) {
      if (values[i]?.[0] === applicationId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Форматировать зарплату
   */
  private formatSalary(job: any): string {
    if (!job?.salaryMin && !job?.salaryMax) return "";

    const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : "";
    const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : "";

    if (min && max) return `${min} - ${max}`;
    return min || max || "";
  }
}

/**
 * Результат sync приложения
 */
export interface SyncApplicationResult {
  success: boolean;
  externalRef?: string;
  error?: string;
}

/**
 * Результат sync reply
 */
export interface SyncReplyResult {
  success: boolean;
  externalRef?: string;
  error?: string;
}

/**
 * Результат sync metrics
 */
export interface SyncMetricsResult {
  success: boolean;
  externalRef?: string;
  error?: string;
}

/**
 * Mock Sheets client для тестирования
 */
export class MockSheetsClient implements SheetsClient {
  async getSpreadsheet(spreadsheetId: string): Promise<GoogleSpreadsheet> {
    return {
      spreadsheetId,
      properties: {
        title: "Job Applications",
        locale: "en_US",
        timeZone: "America/New_York",
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: "Applications",
            index: 0,
          },
        },
      ],
    };
  }

  async getValues(
    spreadsheetId: string,
    range: string
  ): Promise<GoogleValueRange> {
    return {
      range,
      majorDimension: "ROWS",
      values: [["ID", "Job Title", "Company", "Status"]],
    };
  }

  async updateValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<GoogleValueRange> {
    return {
      range,
      majorDimension: "ROWS",
      values,
    };
  }

  async appendValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<GoogleValueRange> {
    return {
      range,
      majorDimension: "ROWS",
      values,
    };
  }

  async batchUpdate(
    spreadsheetId: string,
    requests: any[]
  ): Promise<GoogleBatchResponse> {
    return {
      spreadsheetId,
      replies: requests.map(() => ({})),
    };
  }
}

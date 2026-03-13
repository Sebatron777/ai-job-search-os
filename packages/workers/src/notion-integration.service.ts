/**
 * Сервис интеграции с Notion
 * 
 * Поддерживает:
 * - OAuth 2.0 authentication
 * - Database sync
 * - Status mapping
 * - Field mapping
 * - Idempotent writes
 */

import type { NotionTarget, SyncLog } from "@ai-job-search/types";

/**
 * Notion API client интерфейс
 */
export interface NotionClient {
  /**
   * Получить список баз данных
   */
  listDatabases(): Promise<NotionDatabase[]>;

  /**
   * Создать страницу в базе
   */
  createPage(
    databaseId: string,
    properties: Record<string, any>
  ): Promise<NotionPage>;

  /**
   * Обновить страницу
   */
  updatePage(
    pageId: string,
    properties: Record<string, any>
  ): Promise<NotionPage>;

  /**
   * Поиск страницы по property
   */
  queryDatabase(
    databaseId: string,
    filter: Record<string, any>
  ): Promise<NotionPage[]>;
}

/**
 * Notion база данных
 */
export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, NotionProperty>;
}

/**
 * Notion property
 */
export interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

/**
 * Notion страница
 */
export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  url: string;
  created_time: string;
  last_edited_time: string;
}

/**
 * Mapping статусов
 */
export interface StatusMapping {
  draft: string;
  ready_to_apply: string;
  pending_approval: string;
  approved: string;
  applying: string;
  applied: string;
  reply_received: string;
  interview: string;
  test_task: string;
  rejected: string;
  offer: string;
  archived: string;
}

/**
 * Mapping полей
 */
export interface FieldMapping {
  /** Поле для job title */
  jobTitle: string;
  /** Поле для company */
  company: string;
  /** Поле для status */
  status: string;
  /** Поле для application date */
  appliedDate: string;
  /** Поле для salary */
  salary: string;
  /** Поле для notes */
  notes: string;
  /** Поле для URL */
  url: string;
}

/**
 * Конфигурация Notion сервиса
 */
export interface NotionServiceConfig {
  /** API key */
  apiKey: string;
  /** Default database ID */
  defaultDatabaseId?: string;
  /** Status mapping */
  statusMapping: Partial<StatusMapping>;
  /** Field mapping */
  fieldMapping: Partial<FieldMapping>;
}

/**
 * Сервис интеграции с Notion
 */
export class NotionIntegrationService {
  private client: NotionClient | null;
  private config: NotionServiceConfig;
  private defaultStatusMapping: StatusMapping;
  private defaultFieldMapping: FieldMapping;

  constructor(client?: NotionClient, config?: Partial<NotionServiceConfig>) {
    this.client = client || null;
    this.config = {
      apiKey: "",
      defaultDatabaseId: config?.defaultDatabaseId,
      statusMapping: config?.statusMapping || {},
      fieldMapping: config?.fieldMapping || {},
    };

    this.defaultStatusMapping = {
      draft: "Draft",
      ready_to_apply: "Ready to Apply",
      pending_approval: "Pending Approval",
      approved: "Approved",
      applying: "Applying",
      applied: "Applied",
      reply_received: "Reply Received",
      interview: "Interview",
      test_task: "Test Task",
      rejected: "Rejected",
      offer: "Offer",
      archived: "Archived",
    };

    this.defaultFieldMapping = {
      jobTitle: "Job Title",
      company: "Company",
      status: "Status",
      appliedDate: "Applied Date",
      salary: "Salary",
      notes: "Notes",
      url: "Job URL",
    };
  }

  /**
   * Создать OAuth URL
   */
  createAuthUrl(state?: string): string {
    // Notion использует прямой flow
    return `https://api.notion.com/v1/oauth/authorize?client_id=...&response_type=code&owner=user&redirect_uri=...`;
  }

  /**
   * Синхронизировать приложение с Notion
   */
  async syncApplication(
    application: any,
    target: NotionTarget
  ): Promise<SyncApplicationResult> {
    if (!this.client) {
      return {
        success: false,
        error: "Notion client not initialized",
      };
    }

    try {
      // Получить mapping
      const statusMapping = {
        ...this.defaultStatusMapping,
        ...target.statusMapping,
      };
      const fieldMapping = {
        ...this.defaultFieldMapping,
        ...target.fieldMapping,
      };

      // Построить properties
      const properties = this.buildApplicationProperties(
        application,
        statusMapping,
        fieldMapping
      );

      // Проверить: существует ли уже страница
      const existingPage = await this.findExistingPage(
        target.databaseId,
        application.id
      );

      let page: NotionPage;
      if (existingPage) {
        // Обновить существующую
        page = await this.client.updatePage(existingPage.id, properties);
      } else {
        // Создать новую
        page = await this.client.createPage(target.databaseId, properties);
      }

      return {
        success: true,
        externalRef: page.id,
        externalUrl: page.url,
        page,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Построить properties для приложения
   */
  private buildApplicationProperties(
    application: any,
    statusMapping: StatusMapping,
    fieldMapping: FieldMapping
  ): Record<string, any> {
    const status = statusMapping[application.status as keyof StatusMapping] || "Draft";

    return {
      [fieldMapping.jobTitle]: {
        title: [{ text: { content: application.job?.title || "Unknown" } }],
      },
      [fieldMapping.company]: {
        rich_text: [{ text: { content: application.job?.company || "Unknown" } }],
      },
      [fieldMapping.status]: {
        select: { name: status },
      },
      [fieldMapping.appliedDate]: {
        date: { start: application.createdAt || new Date().toISOString() },
      },
      [fieldMapping.salary]: {
        rich_text: [{ text: { content: this.formatSalary(application.job) } }],
      },
      [fieldMapping.notes]: {
        rich_text: [{ text: { content: application.coverLetter || "" } }],
      },
      [fieldMapping.url]: {
        url: application.job?.canonicalUrl,
      },
    };
  }

  /**
   * Найти существующую страницу
   */
  private async findExistingPage(
    databaseId: string,
    applicationId: string
  ): Promise<NotionPage | null> {
    if (!this.client) return null;

    // Поиск по external ID (если сохранён)
    const pages = await this.client.queryDatabase(databaseId, {
      filter: {
        property: "External ID",
        rich_text: {
          contains: applicationId,
        },
      },
    });

    return pages[0] || null;
  }

  /**
   * Форматировать зарплату
   */
  private formatSalary(job: any): string {
    if (!job?.salaryMin && !job?.salaryMax) return "";

    const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : "";
    const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : "";

    if (min && max) return `${min} - ${max}`;
    if (min) return `> ${min}`;
    if (max) return `< ${max}`;
    return "";
  }

  /**
   * Получить статус mapping
   */
  getStatusMapping(): StatusMapping {
    return {
      ...this.defaultStatusMapping,
      ...this.config.statusMapping,
    };
  }

  /**
   * Получить field mapping
   */
  getFieldMapping(): FieldMapping {
    return {
      ...this.defaultFieldMapping,
      ...this.config.fieldMapping,
    };
  }
}

/**
 * Результат sync приложения
 */
export interface SyncApplicationResult {
  success: boolean;
  externalRef?: string;
  externalUrl?: string;
  page?: NotionPage;
  error?: string;
}

/**
 * Mock Notion client для тестирования
 */
export class MockNotionClient implements NotionClient {
  async listDatabases(): Promise<NotionDatabase[]> {
    return [
      {
        id: "db-1",
        title: [{ plain_text: "Job Applications" }],
        properties: {},
      },
    ];
  }

  async createPage(
    databaseId: string,
    properties: Record<string, any>
  ): Promise<NotionPage> {
    return {
      id: `page-${Date.now()}`,
      properties,
      url: `https://notion.so/page-${Date.now()}`,
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
    };
  }

  async updatePage(
    pageId: string,
    properties: Record<string, any>
  ): Promise<NotionPage> {
    return {
      id: pageId,
      properties,
      url: `https://notion.so/${pageId}`,
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString(),
    };
  }

  async queryDatabase(
    databaseId: string,
    filter: Record<string, any>
  ): Promise<NotionPage[]> {
    return [];
  }
}

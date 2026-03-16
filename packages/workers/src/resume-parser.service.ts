/**
 * Сервис для парсинга файлов резюме (PDF, DOCX) в текст и структурированные данные.
 */

import * as mammoth from "mammoth";
import type { CandidateProfile } from "@ai-job-search/types";
const pdf = require("pdf-parse");

export interface ParsedResume {
  text: string;
  metadata: {
    pageCount?: number;
    author?: string;
  };
}

export class ResumeParserService {
  /**
   * Извлечь текст из файла по его буферу и MIME-типу
   */
  async parseToText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimeType === "text/plain") {
      return buffer.toString("utf-8");
    } else {
      throw new Error(`Unsupported resume format: ${mimeType}`);
    }
  }

  /**
   * Использовать LLM для конвертации сырого текста в структурированный профиль
   * (Продвинутый метод, требующий LLMClient)
   */
  async extractProfile(text: string, llmClient: any): Promise<Partial<CandidateProfile>> {
    const prompt = `
      Extract candidate information from the following resume text. 
      Return ONLY a JSON object matching this structure:
      {
        "firstName": string,
        "lastName": string,
        "email": string,
        "headline": string,
        "location": string,
        "currentTitle": string,
        "currentCompany": string,
        "yearsOfExperience": number,
        "skills": string[]
      }

      Resume Text:
      ${text.slice(0, 10000)} // Limit text size
    `;

    const response = await llmClient.complete({
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    try {
      return JSON.parse(response.content);
    } catch (e) {
      console.error("Failed to parse LLM extraction result:", e);
      return {};
    }
  }
}

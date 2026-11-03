# Anthropic "Claude for Open Source" Application Kit
## Ecosystem Impact Track (`claude.com/open-source-max`)

This document contains ready-to-submit application materials in **English** and **Russian** tailored specifically for the Anthropic "Claude for Open Source" grant program (Ecosystem Impact Track / Claude Ultra access).

---

# 🇺🇸 English Version (Application Form Ready)

### 1. Project Information
- **Project Name:** AI Job Search OS
- **Repository URL:** https://github.com/Sebatron777/ai-job-search-os
- **License:** MIT License (OSI-approved)
- **Primary Tech Stack:** TypeScript, NestJS, Next.js 14, PostgreSQL, BullMQ, Vitest, Anthropic Claude API
- **Target Track:** Ecosystem Impact Track

---

### 2. Short Description / Elevator Pitch (1-2 sentences)
> **AI Job Search OS** is an open-source, candidate-first career operating system powered by Claude that automates job discovery, deduplication, deep semantic matching, and hyper-personalized application drafting with strict human-in-the-loop oversight.

---

### 3. Detailed Project Mission & Value Proposition
Job seeking in today's tech ecosystem is fundamentally broken: proprietary platforms treat candidate data as advertising fuel, automated job boards flood recruiters with low-quality AI spam, and developers struggle with repetitive, fragmented application pipelines.

**AI Job Search OS** solves this problem by providing an open-source, ethical, and intelligent alternative:
1. **Multi-Source Ingestion & Deduplication:** Normalizes disparate job postings into unified, canonical schemas with fuzzy deduplication.
2. **Two-Stage Hybrid Scoring:** Employs a sub-millisecond deterministic filter for hard criteria (salary floor, location constraints, work authorization) followed by deep semantic reasoning via Claude for nuanced technical and cultural alignment.
3. **High-Signal Tailored Drafting:** Rather than superficial template filling, Claude analyzes candidate GitHub repositories, real engineering accomplishments, and employer pain points to synthesize thoughtful cover letters and interview briefing dossiers.
4. **Human-in-the-Loop Governance:** Candidate agency is paramount. No email or application is ever dispatched without explicit review and approval through the web dashboard.

---

### 4. Ecosystem & Developer Community Impact
How this project elevates the broader open-source and Anthropic developer ecosystems:
- **Reference Implementation for Production LLM Agents:** Demonstrates how to build resilient, multi-stage LLM agent pipelines in a full-stack TypeScript/NestJS monorepo with strict JSON schema validation, exponential backoff retries, and comprehensive unit tests (99 automated test cases).
- **Public Domain Prompts & Benchmark Scenarios:** Offers modular, battle-tested prompt packages (`@ai-job-search/prompts`) designed specifically for career evaluation, deterministic pre-filtering, and semantic resume comparison that any developer or university lab can fork and build upon.
- **Empowering Independent Tech Workers:** Democratizes enterprise-grade recruiting intelligence for individual developers, junior engineers, open-source maintainers, and professionals seeking remote opportunities globally.

---

### 5. Why Claude Ultra / Claude 3.5 Sonnet is Essential
Why Claude is the indispensable intelligence foundation for this project:
- **Nuanced Technical Comprehension:** Evaluating whether an engineer’s experience in distributed systems aligns with an obscure distributed consensus role requires deep contextual reasoning that conventional keyword matchers or smaller models completely miss. Claude excels at recognizing transferable problem-solving skills without hallucinating qualifications.
- **Extended Context Window Utilization:** Full candidate profiles (resumes, portfolios, code samples, publication abstracts) alongside rich company documentation demand Claude’s long-context fidelity to perform multi-document synthesis without loss of critical technical detail.
- **Complex Multi-Constraint Output Formatting:** AI Job Search OS relies on strict, predictable structured outputs to drive automated UI workflows, scoring rubrics, and draft generation. Claude provides state-of-the-art instruction adherence and low latency for structured extraction.

---

### 6. 6-Month Roadmap & Planned Milestones
- **Months 1–2:** Integration of Claude Ultra streaming and multi-document context caching for instant candidate portfolio evaluations.
- **Months 3–4:** Interactive mock interview simulator powered by Claude voice/chat with real-time feedback on technical accuracy and communication clarity.
- **Months 5–6:** Open agent plugin ecosystem (browser extension companion, community scrapers for niche developer job boards, and automated ATS compliance checkers).

---
---

# 🇷🇺 Русская версия (Для локальной документации и подачи)

### 1. Информация о проекте
- **Название проекта:** AI Job Search OS
- **URL репозитория:** https://github.com/Sebatron777/ai-job-search-os
- **Лицензия:** MIT (OSI-approved)
- **Технологический стек:** TypeScript, NestJS, Next.js 14, PostgreSQL, BullMQ, Vitest, Anthropic Claude API
- **Трек программы:** Ecosystem Impact Track (Влияние на экосистему)

---

### 2. Краткое описание (Elevator Pitch)
> **AI Job Search OS** — это открытая кандидат-ориентированная операционная система для поиска работы на базе Claude, автоматизирующая сбор вакансий, дедупликацию, глубокий семантический скоринг и создание персонализированных откликов под контролем человека (Human-in-the-Loop).

---

### 3. Миссия проекта и решаемая проблема
Процесс поиска работы сегодня перегружен спамом и неэффективностью. Большинство решений либо бесконтрольно бомбардируют работодателей низкокачественными шаблонными резюме, либо изолируют данные кандидата в закрытых платных сервисах.

**AI Job Search OS** предлагает открытое, качественное решение:
1. **Агрегация и нормализация:** Сбор вакансий из десятков источников, нормализация зарплатных вилок, форматов занятости и устранение дубликатов по нечетким хешам.
2. **Двухэтапный скоринг:** Мгновенный детерминированный фильтр жестких условий + глубокий семантический анализ соответствия кандидата требованиям вакансии через Claude.
3. **Интеллектуальная персонализация:** Генерация сопроводительных писем и заметок для собеседований на основе реального опыта и репозиториев кандидата, а не клише.
4. **Контроль человека (Human-in-the-Loop):** Ни один отклик не отправляется автоматически без одобрения пользователем в веб-интерфейсе.

---

### 4. Вклад в экосистему и сообщество разработчиков
- **Эталонная открытая архитектура LLM-агентов:** Готовый production-ready шаблон TypeScript монорепозитория (NestJS + Next.js + BullMQ) с валидацией JSON-ответов от Claude, механизмом retry, обработкой лимитов и 99 покрывающими тестами.
- **Открытая библиотека промптов:** Пакет `@ai-job-search/prompts` доступен всему сообществу для использования в смежных HR-Tech и AI-ассистент проектах.
- **Доступность для каждого инженера:** Инструмент помогает разработчикам и исследователям находить релевантные позиции по всему миру без посредников и платных подписок.

---

### 5. Почему необходим Claude Ultra / Claude 3.5 Sonnet
- **Глубина рассуждений:** Сравнение профиля разработчика с требованиями компании требует понимания тонких инженерных нюансов (архитектура, паттерны, стек технологий), где Claude опережает любые другие модели.
- **Большое контекстное окно:** Возможность передать в модель полный профиль кандидата (резюме, проекты, описания репозиториев) и детальное описание вакансии для комплексного сопоставления.
- **Безупречное следование формату:** Генерация структурированных оценок в строгом JSON-формате для мгновенного отображения в интерфейсе и дальнейшей обработки в пайплайне.

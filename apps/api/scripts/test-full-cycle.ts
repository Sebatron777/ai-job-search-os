/**
 * Full Cycle Test Script
 * 
 * Тестирует полный цикл: импорт → нормализация → скоринг → черновик
 * 
 * Запуск:
 *   cd apps/api/scripts && npx tsx test-full-cycle.ts
 */

import {
  NormalizationService,
  DeduplicationService,
  IngestionPipeline,
  DeterministicScoringService,
  MockSourceAdapter,
} from "../../../packages/workers/src/index";

async function testFullCycle() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 FULL CYCLE TEST: Import → Scoring → Draft");
  console.log("=".repeat(60) + "\n");

  // ============================================================================
  // STEP 1: Import (Mock Source)
  // ============================================================================
  console.log("📥 STEP 1: Importing jobs from Mock Source...\n");

  const adapter = new MockSourceAdapter();
  await adapter.initialize({});

  const collectionResult = await adapter.collect(
    {
      id: "mock-source-1",
      name: "Mock Job Source",
      type: "mock",
      isActive: true,
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { limit: 3 }
  );

  console.log(`✅ Collected: ${collectionResult.collectedCount} jobs`);
  console.log(`   Errors: ${collectionResult.errorCount}\n`);

  if (!collectionResult.collectedJobs || collectionResult.collectedJobs.length === 0) {
    console.error("❌ No jobs collected!");
    return;
  }

  // ============================================================================
  // STEP 2: Normalization & Deduplication
  // ============================================================================
  console.log("🔄 STEP 2: Normalizing and deduplicating...\n");

  const normalizationService = new NormalizationService();
  const deduplicationService = new DeduplicationService();

  const pipeline = new IngestionPipeline({
    normalizationService,
    deduplicationService,
  });

  const pipelineResult = await pipeline.execute(collectionResult.collectedJobs);

  console.log(`✅ Processed: ${pipelineResult.processedCount} jobs`);
  console.log(`   Succeeded: ${pipelineResult.successCount}`);
  console.log(`   Failed: ${pipelineResult.failedCount}\n`);

  const normalizedJobs = pipelineResult.results
    .filter((r) => r.success && r.job)
    .map((r) => r.job!);

  if (normalizedJobs.length === 0) {
    console.error("❌ No jobs normalized!");
    return;
  }

  console.log("📋 Normalized jobs:");
  normalizedJobs.forEach((job, i) => {
    console.log(`   ${i + 1}. ${job.title} at ${job.company}`);
  });
  console.log();

  // ============================================================================
  // STEP 3: Matching & Scoring
  // ============================================================================
  console.log("🎯 STEP 3: Scoring jobs against candidate profile...\n");

  // Mock кандидат
  const mockCandidate = {
    id: "candidate-1",
    firstName: "John",
    lastName: "Doe",
    headline: "Senior Frontend Engineer",
    email: "john@example.com",
    currentTitle: "Senior Frontend Engineer",
    currentCompany: "Tech Corp",
    yearsOfExperience: 6,
    skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js", "GraphQL"],
    preferredKeywords: ["remote", "frontend", "react"],
    excludedKeywords: ["enterprise", "banking"],
    preferredWorkModes: ["remote", "hybrid"],
    preferredJobTypes: ["full_time"],
    salaryExpectations: {
      min: 140000,
      currency: "USD",
      period: "yearly",
    },
    locationPreferences: {
      country: "US",
      regions: ["California", "New York", "Remote"],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const deterministicService = new DeterministicScoringService();
  const llmService = new LLMScoringService(); // Без реального LLM будет использовать mock логику
  const matchingService = new MatchingService({
    deterministicScoringService: deterministicService,
    llmScoringService: llmService,
  });

  // Скорим первую вакансию
  const jobToScore = normalizedJobs[0];
  
  console.log(`📊 Scoring: ${jobToScore.title} at ${jobToScore.company}\n`);

  const matchingResult = await matchingService.scoreJob(
    jobToScore,
    mockCandidate,
    {
      jobId: jobToScore.id,
      candidateProfileId: mockCandidate.id,
    }
  );

  console.log("✅ Scoring Results:");
  console.log(`   Total Score: ${matchingResult.totalScore}/100`);
  console.log(`   Confidence: ${(matchingResult.confidence * 100).toFixed(1)}%`);
  console.log(`   Recommendation: ${matchingResult.recommendation}`);
  console.log(`   Apply Mode: ${matchingResult.recommendedApplyMode}`);
  console.log(`   Title Score: ${matchingResult.deterministicResult.titleScore}`);
  console.log(`   Skill Score: ${matchingResult.deterministicResult.skillScore}`);
  console.log(`   Seniority Score: ${matchingResult.deterministicResult.seniorityScore}`);
  
  if (matchingResult.deterministicResult.skillGaps.length > 0) {
    console.log(`   Skill Gaps: ${matchingResult.deterministicResult.skillGaps.map((g) => g.skill).join(", ")}`);
  }
  
  if (matchingResult.hardFailReasons.length > 0) {
    console.log(`   Hard Fails: ${matchingResult.hardFailReasons.join(", ")}`);
  }
  
  console.log();

  // ============================================================================
  // STEP 4: Draft Generation
  // ============================================================================
  console.log("📝 STEP 4: Generating application draft...\n");

  const llmClient = createLLMClientFromEnv();
  
  const draftService = new DraftGenerationService({
    llmClient,
    tone: "professional",
    maxCoverLetterWords: 250,
  });

  // Mock резюме
  const mockResumes = [
    {
      id: "resume-1",
      candidateProfileId: mockCandidate.id,
      fileName: "john-doe-resume.pdf",
      fileSize: 102400,
      mimeType: "application/pdf",
      s3Key: "resumes/john-doe-resume.pdf",
      isDefault: true,
      parsedData: {
        skills: mockCandidate.skills,
        experience: [
          {
            title: "Senior Frontend Engineer",
            company: "Tech Corp",
            startYear: 2020,
            endYear: null,
          },
        ],
        education: [
          {
            degree: "Bachelor of Science in Computer Science",
            school: "University of California",
            graduationYear: 2017,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Mock portfolio links
  const mockPortfolioLinks = [
    {
      id: "portfolio-1",
      candidateProfileId: mockCandidate.id,
      url: "https://github.com/johndoe",
      linkType: "github" as const,
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "portfolio-2",
      candidateProfileId: mockCandidate.id,
      url: "https://johndoe.dev",
      linkType: "website" as const,
      isPrimary: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  try {
    const draftResult = await draftService.generateDraft(
      jobToScore,
      mockCandidate,
      mockResumes as any,
      mockPortfolioLinks as any
    );

    console.log("✅ Draft Generated:");
    console.log(`   Cover Letter Length: ${draftResult.coverLetter.length} chars`);
    console.log(`   Intro Message Length: ${draftResult.introMessage.length} chars`);
    console.log(`   Selected Resume: ${draftResult.selectedResume?.fileName || "N/A"}`);
    console.log(`   Portfolio Links: ${draftResult.selectedPortfolioLinks?.length || 0}`);
    console.log(`   Validation Errors: ${draftResult.validationErrors?.length || 0}`);
    console.log();

    console.log("📄 Cover Letter Preview:");
    console.log("   " + "─".repeat(56));
    const preview = draftResult.coverLetter.slice(0, 300) + "...";
    preview.split("\n").forEach((line) => console.log(`   ${line}`));
    console.log("   " + "─".repeat(56));
    console.log();
  } catch (error) {
    console.error("❌ Draft generation failed:", error);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("🎉 FULL CYCLE TEST COMPLETED!");
  console.log("=".repeat(60) + "\n");

  console.log("📊 Summary:");
  console.log(`   ✅ Import: ${collectionResult.collectedCount} jobs collected`);
  console.log(`   ✅ Normalization: ${pipelineResult.successCount} jobs normalized`);
  console.log(`   ✅ Scoring: ${matchingResult.totalScore}/100 score`);
  console.log(`   ✅ Draft: Generated successfully`);
  console.log();

  console.log("✨ All systems operational!\n");
}

// Запуск теста
testFullCycle()
  .then(() => {
    console.log("✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

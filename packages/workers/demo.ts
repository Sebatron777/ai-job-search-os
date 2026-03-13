/**
 * Simple Full Cycle Demo
 * 
 * Запуск:
 *   cd packages/workers && npx tsx demo.ts
 */

import {
  NormalizationService,
  DeduplicationService,
  IngestionPipeline,
  DeterministicScoringService,
  MockSourceAdapter,
} from "./src/index";

async function demo() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 AI JOB SEARCH OS - FULL CYCLE DEMO");
  console.log("=".repeat(60) + "\n");

  // STEP 1: Import
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

  console.log(`✅ Collected: ${collectionResult.collectedCount} jobs\n`);

  if (!collectionResult.collectedJobs || collectionResult.collectedJobs.length === 0) {
    console.error("❌ No jobs collected!");
    return;
  }

  // STEP 2: Normalization
  console.log("🔄 STEP 2: Normalizing jobs...\n");

  const normalizationService = new NormalizationService();
  const deduplicationService = new DeduplicationService();

  const pipeline = new IngestionPipeline({
    normalizationService,
    deduplicationService,
  });

  const pipelineResult = await pipeline.execute(collectionResult.collectedJobs);

  console.log(`✅ Processed: ${pipelineResult.processedCount} jobs`);
  console.log(`   Succeeded: ${pipelineResult.successCount}\n`);

  const normalizedJobs = pipelineResult.results
    .filter((r) => r.success && r.job)
    .map((r) => r.job!);

  if (normalizedJobs.length === 0) {
    console.error("❌ No jobs normalized!");
    return;
  }

  console.log("📋 Normalized jobs:");
  normalizedJobs.forEach((job, i) => {
    console.log(`   ${i + 1}. ${job.title} at ${job.company} (${job.locationType})`);
  });
  console.log();

  // STEP 3: Scoring
  console.log("🎯 STEP 3: Scoring jobs...\n");

  const mockCandidate = {
    id: "candidate-1",
    firstName: "John",
    lastName: "Doe",
    headline: "Senior Frontend Engineer",
    email: "john@example.com",
    currentTitle: "Senior Frontend Engineer",
    currentCompany: "Tech Corp",
    yearsOfExperience: 6,
    skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js"],
    preferredKeywords: ["remote", "frontend"],
    excludedKeywords: ["enterprise"],
    preferredWorkModes: ["remote" as const, "hybrid" as const],
    preferredJobTypes: ["full_time" as const],
    salaryExpectations: {
      min: 140000,
      currency: "USD",
      period: "yearly" as const,
    },
    locationPreferences: {
      country: "US",
      regions: ["California", "Remote"],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const scoringService = new DeterministicScoringService();
  
  const jobToScore = normalizedJobs[0];
  const score = scoringService.score(jobToScore, mockCandidate as any, mockCandidate as any);

  console.log(`📊 Scoring: ${jobToScore.title} at ${jobToScore.company}`);
  console.log(`   Total Score: ${score.totalScore}/100`);
  console.log(`   Title Score: ${score.titleScore}`);
  console.log(`   Skill Score: ${score.skillScore}`);
  console.log(`   Seniority Score: ${score.seniorityScore}`);
  if (score.skillGaps.length > 0) {
    console.log(`   Skill Gaps: ${score.skillGaps.map((g) => g.skill).join(", ")}`);
  }
  console.log();

  // SUMMARY
  console.log("🎉 DEMO COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60) + "\n");
  console.log("✨ Core functionality is working:\n");
  console.log("   ✅ Mock Source Adapter");
  console.log("   ✅ Normalization Pipeline");
  console.log("   ✅ Deduplication");
  console.log("   ✅ Deterministic Scoring");
  console.log();
}

demo()
  .then(() => {
    console.log("✅ Demo completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });

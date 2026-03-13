-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusHistory" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "ApplicationDraft" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "introMessage" TEXT NOT NULL,
    "customAnswers" JSONB NOT NULL,
    "resumeAssetId" TEXT NOT NULL,
    "portfolioLinkIds" JSONB NOT NULL DEFAULT '[]',
    "generationModel" TEXT NOT NULL,
    "generationVersion" TEXT NOT NULL,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',
    "validationErrors" TEXT[],
    "factualChecks" JSONB NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationDraft_jobId_idx" ON "ApplicationDraft"("jobId");

-- CreateIndex
CREATE INDEX "ApplicationDraft_candidateProfileId_idx" ON "ApplicationDraft"("candidateProfileId");

-- CreateIndex
CREATE INDEX "ApplicationDraft_approvalStatus_idx" ON "ApplicationDraft"("approvalStatus");

-- AddForeignKey
ALTER TABLE "ApplicationDraft" ADD CONSTRAINT "ApplicationDraft_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDraft" ADD CONSTRAINT "ApplicationDraft_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDraft" ADD CONSTRAINT "ApplicationDraft_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

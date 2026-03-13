-- AlterTable
ALTER TABLE "JobSource" ADD COLUMN     "activeJobsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCollectionError" TEXT,
ADD COLUMN     "lastCollectionStatus" TEXT;

-- CreateTable
CREATE TABLE "JobPreference" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "jobTypes" TEXT[],
    "workModes" TEXT[],
    "preferredLocations" JSONB NOT NULL DEFAULT '[]',
    "remoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "relocationWilling" BOOLEAN NOT NULL DEFAULT false,
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "salaryPeriod" TEXT NOT NULL DEFAULT 'yearly',
    "seniorityLevels" TEXT[],
    "industries" TEXT[],
    "targetCompanies" TEXT[],
    "excludedCompanies" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_candidateProfileId_key" ON "JobPreference"("candidateProfileId");

-- AddForeignKey
ALTER TABLE "JobPreference" ADD CONSTRAINT "JobPreference_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

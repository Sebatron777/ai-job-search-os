
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  avatarUrl: 'avatarUrl',
  passwordHash: 'passwordHash',
  refreshTokenHash: 'refreshTokenHash',
  emailVerified: 'emailVerified',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  currentMonthJobsCount: 'currentMonthJobsCount',
  currentMonthResumesCount: 'currentMonthResumesCount',
  currentMonthAppsCount: 'currentMonthAppsCount'
};

exports.Prisma.PlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  priceId: 'priceId',
  monthlyPrice: 'monthlyPrice',
  currency: 'currency',
  maxWorkspaces: 'maxWorkspaces',
  maxJobsPerMonth: 'maxJobsPerMonth',
  maxResumesCount: 'maxResumesCount',
  features: 'features',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  planId: 'planId',
  status: 'status',
  stripeId: 'stripeId',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationMembershipScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  type: 'type',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.ConnectedAccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  tokenExpiresAt: 'tokenExpiresAt',
  scopes: 'scopes',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MailboxScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  email: 'email',
  provider: 'provider',
  status: 'status',
  lastSyncAt: 'lastSyncAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  settings: 'settings',
  ownerId: 'ownerId',
  organizationId: 'organizationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MembershipScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  workspaceId: 'workspaceId',
  role: 'role',
  acceptedAt: 'acceptedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CandidateProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  workspaceId: 'workspaceId',
  firstName: 'firstName',
  lastName: 'lastName',
  headline: 'headline',
  location: 'location',
  yearsOfExperience: 'yearsOfExperience',
  currentTitle: 'currentTitle',
  currentCompany: 'currentCompany',
  email: 'email',
  skills: 'skills',
  preferredKeywords: 'preferredKeywords',
  excludedKeywords: 'excludedKeywords',
  voiceTone: 'voiceTone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobPreferenceScalarFieldEnum = {
  id: 'id',
  candidateProfileId: 'candidateProfileId',
  jobTypes: 'jobTypes',
  workModes: 'workModes',
  preferredLocations: 'preferredLocations',
  remoteOnly: 'remoteOnly',
  relocationWilling: 'relocationWilling',
  minSalary: 'minSalary',
  maxSalary: 'maxSalary',
  salaryCurrency: 'salaryCurrency',
  salaryPeriod: 'salaryPeriod',
  seniorityLevels: 'seniorityLevels',
  industries: 'industries',
  targetCompanies: 'targetCompanies',
  excludedCompanies: 'excludedCompanies',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ResumeAssetScalarFieldEnum = {
  id: 'id',
  candidateProfileId: 'candidateProfileId',
  name: 'name',
  storageKey: 'storageKey',
  mimeType: 'mimeType',
  sizeBytes: 'sizeBytes',
  isDefault: 'isDefault',
  targetedRoles: 'targetedRoles',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobSourceScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  name: 'name',
  type: 'type',
  config: 'config',
  status: 'status',
  lastCollectionAt: 'lastCollectionAt',
  lastCollectionStatus: 'lastCollectionStatus',
  lastCollectionError: 'lastCollectionError',
  totalJobsCollected: 'totalJobsCollected',
  activeJobsCount: 'activeJobsCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  sourceId: 'sourceId',
  title: 'title',
  company: 'company',
  canonicalUrl: 'canonicalUrl',
  sourceUrl: 'sourceUrl',
  description: 'description',
  location: 'location',
  locationType: 'locationType',
  isRemote: 'isRemote',
  salaryMin: 'salaryMin',
  salaryMax: 'salaryMax',
  salaryCurrency: 'salaryCurrency',
  salaryPeriod: 'salaryPeriod',
  jobType: 'jobType',
  seniorityLevel: 'seniorityLevel',
  requiredSkills: 'requiredSkills',
  preferredSkills: 'preferredSkills',
  postedAt: 'postedAt',
  status: 'status',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.MatchScoreScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  candidateProfileId: 'candidateProfileId',
  totalScore: 'totalScore',
  confidence: 'confidence',
  titleScore: 'titleScore',
  skillScore: 'skillScore',
  seniorityScore: 'seniorityScore',
  workModeScore: 'workModeScore',
  locationScore: 'locationScore',
  salaryScore: 'salaryScore',
  recommendation: 'recommendation',
  recommendedApplyMode: 'recommendedApplyMode',
  skillGaps: 'skillGaps',
  hardFailReasons: 'hardFailReasons',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  candidateProfileId: 'candidateProfileId',
  jobId: 'jobId',
  matchScoreId: 'matchScoreId',
  status: 'status',
  coverLetter: 'coverLetter',
  introMessage: 'introMessage',
  customAnswers: 'customAnswers',
  submittedAt: 'submittedAt',
  submitMethod: 'submitMethod',
  statusHistory: 'statusHistory',
  lastActivityAt: 'lastActivityAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationDraftScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  jobId: 'jobId',
  candidateProfileId: 'candidateProfileId',
  coverLetter: 'coverLetter',
  introMessage: 'introMessage',
  customAnswers: 'customAnswers',
  resumeAssetId: 'resumeAssetId',
  portfolioLinkIds: 'portfolioLinkIds',
  generationModel: 'generationModel',
  generationVersion: 'generationVersion',
  validationStatus: 'validationStatus',
  validationErrors: 'validationErrors',
  factualChecks: 'factualChecks',
  approvalStatus: 'approvalStatus',
  applicationId: 'applicationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  workspaceId: 'workspaceId',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  changes: 'changes',
  createdAt: 'createdAt'
};

exports.Prisma.OrganizationFeatureScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  featureName: 'featureName',
  isEnabled: 'isEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScheduledTaskScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  status: 'status',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  errorMessage: 'errorMessage',
  retryCount: 'retryCount',
  payload: 'payload',
  result: 'result',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  User: 'User',
  Organization: 'Organization',
  Plan: 'Plan',
  Subscription: 'Subscription',
  OrganizationMembership: 'OrganizationMembership',
  VerificationToken: 'VerificationToken',
  ConnectedAccount: 'ConnectedAccount',
  Mailbox: 'Mailbox',
  Workspace: 'Workspace',
  Membership: 'Membership',
  CandidateProfile: 'CandidateProfile',
  JobPreference: 'JobPreference',
  ResumeAsset: 'ResumeAsset',
  JobSource: 'JobSource',
  Job: 'Job',
  MatchScore: 'MatchScore',
  Application: 'Application',
  ApplicationDraft: 'ApplicationDraft',
  AuditLog: 'AuditLog',
  OrganizationFeature: 'OrganizationFeature',
  ScheduledTask: 'ScheduledTask'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

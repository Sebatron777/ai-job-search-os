import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { ResumesModule } from "./resumes/resumes.module";
import { JobSourcesModule } from "./job-sources/job-sources.module";
import { JobsModule } from "./jobs/jobs.module";
import { MatchingModule } from "./matching/matching.module";
import { ApplicationsModule } from "./applications/applications.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthModule } from "./health/health.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Database
    DatabaseModule,

    // Queue
    QueueModule,

    // Domain modules
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProfilesModule,
    ResumesModule,
    JobSourcesModule,
    JobsModule,
    MatchingModule,
    ApplicationsModule,
    IntegrationsModule,
    AnalyticsModule,

    // System modules
    HealthModule,
  ],
})
export class AppModule {}

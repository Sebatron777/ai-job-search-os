"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const workspaces_module_1 = require("./workspaces/workspaces.module");
const profiles_module_1 = require("./profiles/profiles.module");
const resumes_module_1 = require("./resumes/resumes.module");
const job_sources_module_1 = require("./job-sources/job-sources.module");
const jobs_module_1 = require("./jobs/jobs.module");
const matching_module_1 = require("./matching/matching.module");
const applications_module_1 = require("./applications/applications.module");
const integrations_module_1 = require("./integrations/integrations.module");
const analytics_module_1 = require("./analytics/analytics.module");
const health_module_1 = require("./health/health.module");
const queue_module_1 = require("./queue/queue.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env.local",
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            database_module_1.DatabaseModule,
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
            profiles_module_1.ProfilesModule,
            resumes_module_1.ResumesModule,
            job_sources_module_1.JobSourcesModule,
            jobs_module_1.JobsModule,
            matching_module_1.MatchingModule,
            applications_module_1.ApplicationsModule,
            integrations_module_1.IntegrationsModule,
            analytics_module_1.AnalyticsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
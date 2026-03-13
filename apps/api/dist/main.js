"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const observability_1 = require("./observability");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ["error", "warn", "log", "debug", "verbose"],
    });
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: configService.get("FRONTEND_URL", "http://localhost:3000"),
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("AI Job Search OS API")
        .setDescription("REST API for AI Job Search OS platform")
        .setVersion("1.0")
        .addBearerAuth()
        .addTag("auth", "Authentication endpoints")
        .addTag("users", "User management")
        .addTag("workspaces", "Workspace management")
        .addTag("profiles", "Candidate profiles")
        .addTag("resumes", "Resume assets")
        .addTag("jobs", "Job listings")
        .addTag("sources", "Job sources")
        .addTag("applications", "Applications")
        .addTag("matching", "Job matching")
        .addTag("integrations", "External integrations")
        .addTag("analytics", "Analytics and metrics")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    await (0, observability_1.setupObservability)(app);
    const port = configService.get("PORT", 3001);
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error("Failed to start application:", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
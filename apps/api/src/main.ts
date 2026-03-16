import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { setupObservability } from "./observability";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // Security Headers
  app.use(helmet());

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again after 15 minutes",
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS - разрешаем все origin для production
  app.enableCors({
    origin: true, // Разрешаем все origin (для production лучше указать конкретный Vercel URL)
    credentials: true,
  });

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Observability
  await setupObservability(app);

  const port = configService.get("PORT", 3001);
  await app.listen(port);
  
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});

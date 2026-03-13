import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma service wrapper with graceful shutdown
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Enable shutdown hooks for graceful termination
   */
  async enableShutdownHooks(app: any) {
    process.on("beforeExit", async () => {
      await this.$disconnect();
    });
  }
}

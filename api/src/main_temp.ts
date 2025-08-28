import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Module } from "@nestjs/common";

/**
 * Root application module placeholder.
 * Extend by importing feature modules (character, auth, etc.).
 */
@Module({})
class AppModule {}

/**
 * Bootstrap the NestJS Fastify server.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`[api] listening on :${port}`);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Bootstrap failed", err);
  process.exit(1);
});

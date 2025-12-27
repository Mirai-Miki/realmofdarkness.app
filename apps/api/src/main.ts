import { config } from "dotenv";
import { resolve } from "path";
import { logger } from "@realm/logger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

// Load environment variables from root .env file
config({ path: resolve(__dirname, "../../../.env"), quiet: true });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  logger.exception("Error starting Nest server:", err);
});

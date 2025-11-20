import "@realm/core/utils/source-maps";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error("Error starting server:", err);
});

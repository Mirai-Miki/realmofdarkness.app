import type { TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import type { App } from "supertest/types";

import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    // eslint-disable-next-line
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});

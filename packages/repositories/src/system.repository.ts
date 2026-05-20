import { db } from "@realm/database";
import { sql } from "drizzle-orm";
import type { ISystemRepository } from "@realm/common";

export class SystemRepository implements ISystemRepository {
  /**
   * Pings the database to check if it's healthy.
   *
   * @returns true if the connection is alive, false otherwise
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}

import { db, guilds, insertGuildSchema, closeDatabase } from "@realm/database";
import type { GuildData, GuildRepositoryInput, Snowflake } from "@realm/common";
import {
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
  SnowflakeSchema,
} from "@realm/common";
import { GuildRepository } from "../src/guild.repository";

/**
 * Helper to convert test strings to branded Snowflake types.
 * Uses Zod parser to ensure valid snowflake format.
 */
const toSnowflake = (id: string): Snowflake => SnowflakeSchema.parse(id);
const toSnowflakes = (ids: string[]): Snowflake[] => ids.map(toSnowflake);

describe("GuildRepository", () => {
  let repository: GuildRepository;
  const testGuildId = toSnowflake("999999999999999999"); // Use a specific test ID
  const testGuildId2 = toSnowflake("888888888888888888");

  beforeAll(async () => {
    repository = new GuildRepository();
  });

  beforeEach(async () => {
    // Clean up ALL test data before each test to prevent contamination
    // This ensures a clean slate even if previous tests failed
    await db.delete(guilds);
  });

  afterAll(async () => {
    // Final cleanup
    await db.delete(guilds);
    // Close database connection to allow Jest to exit cleanly
    await closeDatabase();
  });

  describe("create", () => {
    it("should create a new guild", async () => {
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: toSnowflakes(["111222333444555666"]),
      };

      const created = await repository.create(guildInput);

      expect(created).toBeDefined();
      expect(created.id).toBe(testGuildId);
      expect(created.name).toBe("Test Guild");
      expect(created.iconUrl).toBe(guildInput.iconUrl);
      expect(created.storytellerRoleIds).toEqual(guildInput.storytellerRoleIds);
    });

    it("should throw error when creating duplicate guild", async () => {
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: [],
      };

      // Create first time
      await repository.create(guildInput);

      // Try to create again - should fail
      await expect(repository.create(guildInput)).rejects.toThrow();
    });

    it("should validate guild data before creating", async () => {
      const invalidGuild = {
        id: testGuildId,
        name: "A".repeat(101), // Exceeds max length
        iconUrl: "https://example.com",
        storytellerRoleIds: [],
      } as GuildRepositoryInput;

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find an existing guild", async () => {
      // First create a guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Find Me Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };
      await repository.create(guildInput);

      // Then find it
      const found = await repository.findById(testGuildId);

      expect(found).toBeDefined();
      expect(found?.id).toBe(testGuildId);
      expect(found?.name).toBe("Find Me Guild");
    });

    it("should return null for non-existent guild", async () => {
      const found = await repository.findById(
        toSnowflake("000000000000000000")
      );
      expect(found).toBeNull();
    });

    it("should throw error for invalid snowflake format", async () => {
      // @ts-expect-error - Testing with invalid string format
      await expect(repository.findById("invalid-id")).rejects.toThrow();
      // @ts-expect-error - Testing with empty string
      await expect(repository.findById("")).rejects.toThrow();
      // @ts-expect-error - Testing with string too short
      await expect(repository.findById("123")).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update an existing guild", async () => {
      // Create initial guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Original Name",
        iconUrl: "https://example.com/original.png",
        storytellerRoleIds: [],
      };
      const created = await repository.create(guildInput);

      // Update it
      const updateData: GuildData = {
        ...created,
        name: "Updated Name",
        iconUrl: "https://example.com/updated.png",
      };
      const updated = await repository.update(updateData);

      expect(updated.name).toBe("Updated Name");
      expect(updated.iconUrl).toBe("https://example.com/updated.png");
    });

    it("should not update database when nothing has changed", async () => {
      // Create initial guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Unchanged Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: toSnowflakes(["123456789012345678"]),
      };
      const created = await repository.create(guildInput);
      const originalLastUpdated = created.lastUpdated;

      // Wait a moment to ensure timestamp would change if update occurred
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Update with same data
      const updateData: GuildData = {
        ...created,
        name: "Unchanged Guild", // Same name
        iconUrl: "https://example.com/icon.png", // Same icon
        storytellerRoleIds: toSnowflakes(["123456789012345678"]), // Same roles
      };
      const updated = await repository.update(updateData);

      // lastUpdated should NOT change since data didn't change
      expect(updated.lastUpdated.getTime()).toBe(originalLastUpdated.getTime());
      expect(updated.name).toBe("Unchanged Guild");
    });

    it("should update when storytellerRoleIds change", async () => {
      // Create initial guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Role Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: toSnowflakes(["111111111111111111"]),
      };
      const created = await repository.create(guildInput);

      // Wait a moment to ensure timestamp would change
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update with different roles
      const updateData: GuildData = {
        ...created,
        storytellerRoleIds: toSnowflakes([
          "222222222222222222",
          "333333333333333333",
        ]),
      };
      const updated = await repository.update(updateData);

      // Roles should have changed
      expect(updated.storytellerRoleIds).toEqual([
        "222222222222222222",
        "333333333333333333",
      ]);
      // lastUpdated SHOULD be different since roles changed
      expect(updated.lastUpdated.getTime()).not.toBe(
        created.lastUpdated.getTime()
      );
    });

    it("should throw error when updating non-existent guild", async () => {
      const nonExistentGuild: GuildData = {
        // @ts-expect-error - Testing with plain string instead of branded Snowflake
        id: "000000000000000000",
        name: "Ghost Guild",
        iconUrl: "",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.update(nonExistentGuild)).rejects.toThrow(
        "Guild not found for update"
      );
    });

    it("should validate snowflake format in update", async () => {
      const invalidGuild: GuildData = {
        // @ts-expect-error - Testing with invalid string instead of branded Snowflake
        id: "invalid-snowflake",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.update(invalidGuild)).rejects.toThrow();
    });

    it("should validate name length in update", async () => {
      // First create a valid guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Valid Name",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };
      const created = await repository.create(guildInput);

      // Try to update with invalid name
      const invalidUpdate: GuildData = {
        ...created,
        name: "A".repeat(GuildNameConstraints.MaxLength + 10),
      };

      await expect(repository.update(invalidUpdate)).rejects.toThrow();
    });

    it("should validate iconUrl length in update", async () => {
      // First create a valid guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };
      const created = await repository.create(guildInput);

      // Try to update with invalid iconUrl
      const invalidUpdate: GuildData = {
        ...created,
        iconUrl: "https://example.com/" + "A".repeat(DiscordCdnUrlMaxLength),
      };

      await expect(repository.update(invalidUpdate)).rejects.toThrow();
    });
  });

  describe("upsert", () => {
    it("should insert a new guild when it doesn't exist", async () => {
      const input: GuildRepositoryInput = {
        id: testGuildId,
        name: "New Guild",
        iconUrl: "https://example.com/new.png",
        storytellerRoleIds: toSnowflakes(["123456789012345678"]),
      };

      const result = await repository.upsert(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(testGuildId);
      expect(result.name).toBe("New Guild");
      expect(result.iconUrl).toBe("https://example.com/new.png");
      expect(result.storytellerRoleIds).toEqual(["123456789012345678"]);
    });

    it("should update existing guild when it exists", async () => {
      // First insert
      const firstInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "First Name",
        iconUrl: "https://example.com/first.png",
        storytellerRoleIds: toSnowflakes(["111111111111111111"]),
      };
      await repository.upsert(firstInput);

      // Then upsert again (should update)
      const secondInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Second Name",
        iconUrl: "https://example.com/second.png",
        storytellerRoleIds: toSnowflakes(["222222222222222222"]),
      };
      const result = await repository.upsert(secondInput);

      expect(result.name).toBe("Second Name");
      expect(result.iconUrl).toBe("https://example.com/second.png");
      expect(result.storytellerRoleIds).toEqual(["222222222222222222"]);
    });

    it("should not update database when upserting with no changes", async () => {
      // First insert
      const firstInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Unchanged Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: toSnowflakes(["111111111111111111"]),
      };
      const first = await repository.upsert(firstInput);
      const originalLastUpdated = first.lastUpdated;

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Upsert with exact same data
      const secondInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Unchanged Guild", // Same
        iconUrl: "https://example.com/icon.png", // Same
        storytellerRoleIds: toSnowflakes(["111111111111111111"]), // Same
      };
      const second = await repository.upsert(secondInput);

      // lastUpdated should NOT change since nothing changed
      expect(second.lastUpdated.getTime()).toBe(originalLastUpdated.getTime());
      expect(second.name).toBe("Unchanged Guild");
    });

    it("should handle upsert without storytellerRoleIds", async () => {
      const input: GuildRepositoryInput = {
        id: testGuildId,
        name: "Guild Without Roles",
        iconUrl: "https://example.com/icon.png",
      };

      const result = await repository.upsert(input);

      expect(result).toBeDefined();
      expect(result.storytellerRoleIds).toEqual([]);
    });

    it("should validate insert values with Zod schema", async () => {
      const input: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl:
          "https://cdn.discordapp.com/icons/979622580950548520/62a3b63c3b0e0ae23ff0002f7d26a2e7.webp",
        storytellerRoleIds: [],
      };

      // This should not throw
      const result = await repository.upsert(input);
      expect(result).toBeDefined();
    });

    it("should use Drizzle's inferred types correctly", async () => {
      // This test verifies the fix for the original bug
      const input: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Place",
        iconUrl:
          "https://cdn.discordapp.com/icons/979622580950548520/62a3b63c3b0e0ae23ff0002f7d26a2e7.webp",
      };

      // Verify insertValues uses correct Zod schema
      const now = new Date();
      const insertValues = insertGuildSchema.parse({
        id: input.id,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
        createdAt: now,
        lastUpdated: now,
      });

      // Verify fields are camelCase (not snake_case)
      expect(insertValues).toHaveProperty("iconUrl");
      expect(insertValues).toHaveProperty("storytellerRoleIds");
      expect(insertValues).toHaveProperty("lastUpdated");

      // Now test the actual upsert
      const result = await repository.upsert(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(testGuildId);
      expect(result.name).toBe("Test Place");
    });

    it("should update only provided fields on conflict", async () => {
      // Insert initial guild
      await repository.upsert({
        id: testGuildId,
        name: "Initial Name",
        iconUrl: "https://example.com/initial.png",
        storytellerRoleIds: toSnowflakes(["111111111111111111"]),
      });

      // Upsert without storytellerRoleIds (should not change them)
      const result = await repository.upsert({
        id: testGuildId,
        name: "Updated Name",
        iconUrl: "https://example.com/updated.png",
      });

      expect(result.name).toBe("Updated Name");
      expect(result.iconUrl).toBe("https://example.com/updated.png");
      // storytellerRoleIds should remain unchanged
      expect(result.storytellerRoleIds).toEqual(["111111111111111111"]);
    });
  });

  describe("delete", () => {
    it("should delete an existing guild", async () => {
      // Create a guild
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Delete Me",
        iconUrl: "",
        storytellerRoleIds: [],
      };
      await repository.create(guildInput);

      // Delete it
      await repository.delete(testGuildId);

      // Verify it's gone
      const found = await repository.findById(testGuildId);
      expect(found).toBeNull();
    });

    it("should throw error for invalid snowflake format", async () => {
      // @ts-expect-error - Testing with invalid string
      await expect(repository.delete("invalid-id")).rejects.toThrow();
      // @ts-expect-error - Testing with empty string
      await expect(repository.delete("")).rejects.toThrow();
    });
  });

  describe("exists", () => {
    it("should return true for existing guild", async () => {
      const guildInput: GuildRepositoryInput = {
        id: testGuildId,
        name: "Exists Test",
        iconUrl: "",
        storytellerRoleIds: [],
      };
      await repository.create(guildInput);

      const exists = await repository.exists(testGuildId);
      expect(exists).toBe(true);
    });

    it("should return false for non-existent guild", async () => {
      const exists = await repository.exists(toSnowflake("000000000000000000"));
      expect(exists).toBe(false);
    });

    it("should throw error for invalid snowflake format", async () => {
      // @ts-expect-error - Testing with invalid string
      await expect(repository.exists("invalid-id")).rejects.toThrow();
      // @ts-expect-error - Testing with empty string
      await expect(repository.exists("")).rejects.toThrow();
    });
  });

  describe("runtime validation", () => {
    it("should validate snowflake format in upsert", async () => {
      const invalidInput: GuildRepositoryInput = {
        // @ts-expect-error - Testing with invalid snowflake format
        id: "not-a-snowflake",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
      };

      await expect(repository.upsert(invalidInput)).rejects.toThrow();
    });

    it("should reject name exceeding max length", async () => {
      const invalidGuild: GuildRepositoryInput = {
        id: testGuildId,
        name: "A".repeat(GuildNameConstraints.MaxLength + 10),
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should accept name at exact max length", async () => {
      const validGuild: GuildRepositoryInput = {
        id: testGuildId,
        name: "A".repeat(GuildNameConstraints.MaxLength),
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };

      const created = await repository.create(validGuild);
      expect(created.name).toBe(validGuild.name);
      expect(created.name.length).toBe(GuildNameConstraints.MaxLength);
    });

    it("should reject iconUrl exceeding max length", async () => {
      const invalidGuild: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/" + "A".repeat(DiscordCdnUrlMaxLength),
        storytellerRoleIds: [],
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should accept iconUrl at exact max length", async () => {
      const validIconUrl = "A".repeat(DiscordCdnUrlMaxLength);
      const validGuild: GuildRepositoryInput = {
        id: testGuildId2,
        name: "Test Guild",
        iconUrl: validIconUrl,
        storytellerRoleIds: [],
      };

      const created = await repository.create(validGuild);
      expect(created.iconUrl).toBe(validIconUrl);
      expect(created.iconUrl!.length).toBe(DiscordCdnUrlMaxLength);
    });

    it("should validate storytellerRoleIds are valid snowflakes", async () => {
      const invalidGuild: GuildRepositoryInput = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: ["invalid-role-id"] as any,
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should reject empty snowflake strings", async () => {
      const invalidGuild: GuildRepositoryInput = {
        // @ts-expect-error - Testing with empty string ID
        id: "",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should reject snowflakes that are too short", async () => {
      const invalidGuild: GuildRepositoryInput = {
        // @ts-expect-error - Testing with string too short to be a snowflake
        id: "123456",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });
  });
});

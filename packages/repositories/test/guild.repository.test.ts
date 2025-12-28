import { db, guilds, insertGuildSchema } from "@realm/database";
import { eq } from "drizzle-orm";
import type { GuildData, UpsertGuildInput } from "@realm/common";
import { GuildNameConstraints, DiscordCdnUrlMaxLength } from "@realm/common";
import { GuildRepository } from "../src/guild.repository";

describe("GuildRepository", () => {
  let repository: GuildRepository;
  const testGuildId = "999999999999999999"; // Use a specific test ID
  const testGuildId2 = "888888888888888888";

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
  });

  describe("create", () => {
    it("should create a new guild", async () => {
      const guildData: GuildData = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: ["111222333444555666"],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const created = await repository.create(guildData);

      expect(created).toBeDefined();
      expect(created.id).toBe(testGuildId);
      expect(created.name).toBe("Test Guild");
      expect(created.iconUrl).toBe(guildData.iconUrl);
      expect(created.storytellerRoleIds).toEqual(guildData.storytellerRoleIds);
    });

    it("should throw error when creating duplicate guild", async () => {
      const guildData: GuildData = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      // Create first time
      await repository.create(guildData);

      // Try to create again - should fail
      await expect(repository.create(guildData)).rejects.toThrow();
    });

    it("should validate guild data before creating", async () => {
      const invalidGuild = {
        id: testGuildId,
        name: "A".repeat(101), // Exceeds max length
        iconUrl: "https://example.com",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      } as GuildData;

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find an existing guild", async () => {
      // First create a guild
      const guildData: GuildData = {
        id: testGuildId,
        name: "Find Me Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      // Then find it
      const found = await repository.findById(testGuildId);

      expect(found).toBeDefined();
      expect(found?.id).toBe(testGuildId);
      expect(found?.name).toBe("Find Me Guild");
    });

    it("should return null for non-existent guild", async () => {
      const found = await repository.findById("000000000000000000");
      expect(found).toBeNull();
    });

    it("should throw error for invalid snowflake format", async () => {
      await expect(repository.findById("invalid-id")).rejects.toThrow();
      await expect(repository.findById("")).rejects.toThrow();
      await expect(repository.findById("123")).rejects.toThrow(); // Too short
    });
  });

  describe("update", () => {
    it("should update an existing guild", async () => {
      // Create initial guild
      const guildData: GuildData = {
        id: testGuildId,
        name: "Original Name",
        iconUrl: "https://example.com/original.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      // Update it
      const updateData: GuildData = {
        ...guildData,
        name: "Updated Name",
        iconUrl: "https://example.com/updated.png",
      };
      const updated = await repository.update(updateData);

      expect(updated.name).toBe("Updated Name");
      expect(updated.iconUrl).toBe("https://example.com/updated.png");
    });

    it("should not update database when nothing has changed", async () => {
      // Create initial guild
      const guildData: GuildData = {
        id: testGuildId,
        name: "Unchanged Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: ["123456789012345678"],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      const created = await repository.create(guildData);
      const originalLastUpdated = created.lastUpdated;

      // Wait a moment to ensure timestamp would change if update occurred
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Update with same data
      const updateData: GuildData = {
        ...created,
        name: "Unchanged Guild", // Same name
        iconUrl: "https://example.com/icon.png", // Same icon
        storytellerRoleIds: ["123456789012345678"], // Same roles
      };
      const updated = await repository.update(updateData);

      // lastUpdated should NOT change since data didn't change
      expect(updated.lastUpdated.getTime()).toBe(originalLastUpdated.getTime());
      expect(updated.name).toBe("Unchanged Guild");
    });

    it("should update when storytellerRoleIds change", async () => {
      // Create initial guild
      const guildData: GuildData = {
        id: testGuildId,
        name: "Role Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: ["111111111111111111"],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      const created = await repository.create(guildData);

      // Wait a moment to ensure timestamp would change
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update with different roles
      const updateData: GuildData = {
        ...created,
        storytellerRoleIds: ["222222222222222222", "333333333333333333"],
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
      const guildData: GuildData = {
        id: testGuildId,
        name: "Valid Name",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      // Try to update with invalid name
      const invalidUpdate: GuildData = {
        ...guildData,
        name: "A".repeat(GuildNameConstraints.MaxLength + 10),
      };

      await expect(repository.update(invalidUpdate)).rejects.toThrow();
    });

    it("should validate iconUrl length in update", async () => {
      // First create a valid guild
      const guildData: GuildData = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      // Try to update with invalid iconUrl
      const invalidUpdate: GuildData = {
        ...guildData,
        iconUrl: "https://example.com/" + "A".repeat(DiscordCdnUrlMaxLength),
      };

      await expect(repository.update(invalidUpdate)).rejects.toThrow();
    });
  });

  describe("upsert", () => {
    it("should insert a new guild when it doesn't exist", async () => {
      const input: UpsertGuildInput = {
        id: testGuildId,
        name: "New Guild",
        iconUrl: "https://example.com/new.png",
        storytellerRoleIds: ["123456789012345678"],
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
      const firstInput: UpsertGuildInput = {
        id: testGuildId,
        name: "First Name",
        iconUrl: "https://example.com/first.png",
        storytellerRoleIds: ["111111111111111111"],
      };
      await repository.upsert(firstInput);

      // Then upsert again (should update)
      const secondInput: UpsertGuildInput = {
        id: testGuildId,
        name: "Second Name",
        iconUrl: "https://example.com/second.png",
        storytellerRoleIds: ["222222222222222222"],
      };
      const result = await repository.upsert(secondInput);

      expect(result.name).toBe("Second Name");
      expect(result.iconUrl).toBe("https://example.com/second.png");
      expect(result.storytellerRoleIds).toEqual(["222222222222222222"]);
    });

    it("should not update database when upserting with no changes", async () => {
      // First insert
      const firstInput: UpsertGuildInput = {
        id: testGuildId,
        name: "Unchanged Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: ["111111111111111111"],
      };
      const first = await repository.upsert(firstInput);
      const originalLastUpdated = first.lastUpdated;

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Upsert with exact same data
      const secondInput: UpsertGuildInput = {
        id: testGuildId,
        name: "Unchanged Guild", // Same
        iconUrl: "https://example.com/icon.png", // Same
        storytellerRoleIds: ["111111111111111111"], // Same
      };
      const second = await repository.upsert(secondInput);

      // lastUpdated should NOT change since nothing changed
      expect(second.lastUpdated.getTime()).toBe(originalLastUpdated.getTime());
      expect(second.name).toBe("Unchanged Guild");
    });

    it("should handle upsert without storytellerRoleIds", async () => {
      const input: UpsertGuildInput = {
        id: testGuildId,
        name: "Guild Without Roles",
        iconUrl: "https://example.com/icon.png",
      };

      const result = await repository.upsert(input);

      expect(result).toBeDefined();
      expect(result.storytellerRoleIds).toEqual([]);
    });

    it("should validate insert values with Zod schema", async () => {
      const input: UpsertGuildInput = {
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
      const input: UpsertGuildInput = {
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
        storytellerRoleIds: ["111111111111111111"],
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
      const guildData: GuildData = {
        id: testGuildId,
        name: "Delete Me",
        iconUrl: "",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      // Delete it
      await repository.delete(testGuildId);

      // Verify it's gone
      const found = await repository.findById(testGuildId);
      expect(found).toBeNull();
    });

    it("should throw error for invalid snowflake format", async () => {
      await expect(repository.delete("invalid-id")).rejects.toThrow();
      await expect(repository.delete("")).rejects.toThrow();
    });
  });

  describe("exists", () => {
    it("should return true for existing guild", async () => {
      const guildData: GuildData = {
        id: testGuildId,
        name: "Exists Test",
        iconUrl: "",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      await repository.create(guildData);

      const exists = await repository.exists(testGuildId);
      expect(exists).toBe(true);
    });

    it("should return false for non-existent guild", async () => {
      const exists = await repository.exists("000000000000000000");
      expect(exists).toBe(false);
    });

    it("should throw error for invalid snowflake format", async () => {
      await expect(repository.exists("invalid-id")).rejects.toThrow();
      await expect(repository.exists("")).rejects.toThrow();
    });
  });

  describe("runtime validation", () => {
    it("should validate snowflake format in upsert", async () => {
      const invalidInput: UpsertGuildInput = {
        id: "not-a-snowflake",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
      };

      await expect(repository.upsert(invalidInput)).rejects.toThrow();
    });

    it("should reject name exceeding max length", async () => {
      const invalidGuild: GuildData = {
        id: testGuildId,
        name: "A".repeat(GuildNameConstraints.MaxLength + 10),
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should accept name at exact max length", async () => {
      const validGuild: GuildData = {
        id: testGuildId,
        name: "A".repeat(GuildNameConstraints.MaxLength),
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const created = await repository.create(validGuild);
      expect(created.name).toBe(validGuild.name);
      expect(created.name.length).toBe(GuildNameConstraints.MaxLength);
    });

    it("should reject iconUrl exceeding max length", async () => {
      const invalidGuild: GuildData = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/" + "A".repeat(DiscordCdnUrlMaxLength),
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should accept iconUrl at exact max length", async () => {
      const validIconUrl = "A".repeat(DiscordCdnUrlMaxLength);
      const validGuild: GuildData = {
        id: testGuildId2,
        name: "Test Guild",
        iconUrl: validIconUrl,
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const created = await repository.create(validGuild);
      expect(created.iconUrl).toBe(validIconUrl);
      expect(created.iconUrl!.length).toBe(DiscordCdnUrlMaxLength);
    });

    it("should validate storytellerRoleIds are valid snowflakes", async () => {
      const invalidGuild: GuildData = {
        id: testGuildId,
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: ["invalid-role-id"] as any,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should reject empty snowflake strings", async () => {
      const invalidGuild: GuildData = {
        id: "",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });

    it("should reject snowflakes that are too short", async () => {
      const invalidGuild: GuildData = {
        id: "123456", // Too short
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      await expect(repository.create(invalidGuild)).rejects.toThrow();
    });
  });
});

import {
  guilds,
  insertGuildSchema,
  selectGuildSchema,
} from "../src/schema/guilds";

describe("Guild Schema", () => {
  describe("insertGuildSchema", () => {
    it("should validate a complete guild insert with all fields", () => {
      const validGuild = {
        id: "123456789012345678",
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: ["987654321098765432", "111222333444555666"],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.safeParse(validGuild);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(validGuild.id);
        expect(result.data.name).toBe(validGuild.name);
        expect(result.data.iconUrl).toBe(validGuild.iconUrl);
        expect(result.data.storytellerRoleIds).toEqual(
          validGuild.storytellerRoleIds
        );
      }
    });

    it("should validate guild insert with minimal required fields", () => {
      const minimalGuild = {
        id: "123456789012345678",
        name: "Minimal Guild",
        iconUrl: "",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.safeParse(minimalGuild);
      expect(result.success).toBe(true);
    });

    it("should validate guild insert with optional storytellerRoleIds omitted", () => {
      const guildWithoutRoles = {
        id: "123456789012345678",
        name: "Guild Without Roles",
        iconUrl: "https://example.com/icon.png",
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.safeParse(guildWithoutRoles);
      expect(result.success).toBe(true);
    });

    it("should allow optional createdAt and lastUpdated (have defaults)", () => {
      // These fields have defaultNow() so they're optional in insert
      const guildWithoutTimestamps = {
        id: "123456789012345678",
        name: "Test Guild",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
      };

      const result = insertGuildSchema.safeParse(guildWithoutTimestamps);
      expect(result.success).toBe(true);
    });

    it("should reject guild with missing required name", () => {
      const invalidGuild = {
        id: "123456789012345678",
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.safeParse(invalidGuild);
      expect(result.success).toBe(false);
    });

    it("should reject guild with name exceeding max length", () => {
      const invalidGuild = {
        id: "123456789012345678",
        name: "A".repeat(101), // Max is 100
        iconUrl: "https://example.com/icon.png",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.safeParse(invalidGuild);
      expect(result.success).toBe(false);
    });

    it("should validate partial guild data for updates", () => {
      const partialUpdate = {
        name: "Updated Name",
        iconUrl: "https://new-cdn.com/icon.png",
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.partial().safeParse(partialUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(partialUpdate.name);
        expect(result.data.iconUrl).toBe(partialUpdate.iconUrl);
      }
    });

    it("should validate partial update with storytellerRoleIds", () => {
      const partialUpdate = {
        storytellerRoleIds: ["123456789012345678"],
        lastUpdated: new Date(),
      };

      const result = insertGuildSchema.partial().safeParse(partialUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.storytellerRoleIds).toEqual(
          partialUpdate.storytellerRoleIds
        );
      }
    });

    it("should handle field name consistency (camelCase)", () => {
      // This test verifies that the schema uses camelCase field names
      // which Drizzle will convert to snake_case for SQL
      const guild = {
        id: "123456789012345678",
        name: "Test",
        iconUrl: "https://example.com/icon.png", // camelCase
        storytellerRoleIds: [], // camelCase
        createdAt: new Date(),
        lastUpdated: new Date(), // camelCase
      };

      const result = insertGuildSchema.safeParse(guild);
      expect(result.success).toBe(true);

      // Verify the parsed data uses camelCase
      if (result.success) {
        expect(result.data).toHaveProperty("iconUrl");
        expect(result.data).toHaveProperty("storytellerRoleIds");
        expect(result.data).toHaveProperty("lastUpdated");
        // These should NOT exist (snake_case versions)
        expect(result.data).not.toHaveProperty("icon_url");
        expect(result.data).not.toHaveProperty("storyteller_role_ids");
        expect(result.data).not.toHaveProperty("last_updated");
      }
    });
  });

  describe("selectGuildSchema", () => {
    it("should validate a complete guild select result", () => {
      const guildFromDb = {
        id: "123456789012345678",
        name: "Test Guild",
        iconUrl: "https://cdn.discordapp.com/icons/123/abc.png",
        storytellerRoleIds: ["987654321098765432"],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      const result = selectGuildSchema.safeParse(guildFromDb);
      expect(result.success).toBe(true);
    });
  });

  describe("Drizzle table definition", () => {
    it("should have guilds table defined", () => {
      expect(guilds).toBeDefined();
      // Note: Drizzle's internal structure may not have _.name in all versions
    });

    it("should infer correct insert type", () => {
      type GuildInsert = typeof guilds.$inferInsert;

      // Type test - this will fail at compile time if types are wrong
      const testInsert: GuildInsert = {
        id: "123456789012345678",
        name: "Test",
        iconUrl: "https://example.com",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      expect(testInsert).toBeDefined();
    });

    it("should infer correct select type", () => {
      type GuildSelect = typeof guilds.$inferSelect;

      // Type test
      const testSelect: GuildSelect = {
        id: "123456789012345678",
        name: "Test",
        iconUrl: "https://example.com",
        storytellerRoleIds: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      expect(testSelect).toBeDefined();
    });
  });
});

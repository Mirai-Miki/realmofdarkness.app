import type { UserDb } from "@realm/database";
import { User } from "discord.js";
import { RealmError } from "@realm/logger/errors";
import { logger } from "@realm/logger";
import { db } from "@realm/database";
import { users } from "@realm/database/schema/users";
import { eq } from "drizzle-orm";
import { SupporterName } from "@realm/core";

const location = "bot/src/entities/user.ts";

/**
 * Extended User class that combines Discord.js User functionality with database operations.
 * Provides seamless access to both Discord data and database-stored user information.
 *
 * TypeScript Safety: Use the method `isDbDataLoaded()` to check if data is loaded before
 * accessing database properties, or call `assertDbDataLoaded()` to throw if not loaded.
 *
 * @example
 * ```typescript
 * // Basic usage with type safety
 * const appUser = AppUser.from(interaction.user);
 * await appUser.loadDbData();
 *
 * if (appUser.isDbDataLoaded()) {
 *   // Safe to access database properties
 *   console.log(`Admin: ${appUser.isAdmin}`);
 *   console.log(`Registered: ${appUser.isRegistered}`);
 * }
 *
 * // Or use assertion for more direct access
 * await appUser.loadDbData();
 * appUser.assertDbDataLoaded(); // Throws if not loaded
 * console.log(`Email: ${appUser.email}`); // Safe to access
 * ```
 */
export class AppUser extends User {
  private _dbData: UserDb | null = null;
  private _dbDataLoaded = false;
  private _hasChanges = false;

  /**
   * Creates an AppUser instance from an existing Discord.js User.
   * This copies all the properties from the original User and extends it with database functionality.
   *
   * @param user - The Discord.js User instance to extend
   * @returns A new AppUser instance with all Discord.js functionality plus database methods
   *
   * @example
   * ```typescript
   * // In a command handler
   * const appUser = AppUser.from(interaction.user);
   * await appUser.loadDbData();
   *
   * if (appUser.isDbDataLoaded()) {
   *   // TypeScript now knows _dbData is loaded
   *   console.log(appUser.isAdmin); // Safe to access
   * }
   * ```
   */
  static from(user: User): AppUser {
    // Create a new AppUser instance by copying the original User's data
    const appUser = Object.create(AppUser.prototype);

    // Copy all properties from the original User
    Object.assign(appUser, user);

    // Initialize our additional properties
    appUser._dbData = null;
    appUser._dbDataLoaded = false;
    appUser._hasChanges = false;

    return appUser as AppUser;
  }

  /**
   * Checks if this user exists in the database and loads it if it does.
   *
   * @returns Promise resolving to true if user exists in database, false otherwise
   */
  async existsInDb(): Promise<boolean> {
    await this.loadDbData();
    return this._dbData !== null;
  }

  /**
   * Creates this user in the database if they don't already exist.
   *
   * @returns Promise resolving to true if user was created or already exists
   *
   * @example
   * ```typescript
   * const appUser = AppUser.from(interaction.user);
   * await appUser.createInDb({ registered: true });
   *
   * if (appUser.isDbDataLoaded()) {
   *   console.log(`User created: ${appUser.username}`);
   * }
   * ```
   */
  async createInDb(): Promise<boolean> {
    try {
      if (await this.existsInDb()) {
        return true;
      }

      // Create new user
      const newUser: Omit<UserDb, "createdAt" | "updatedAt" | "lastActive"> = {
        id: this.id,
        username: this.username,
        displayName: this.displayName,
        email: null,
        avatarUrl: this.displayAvatarURL(),
        supporter: SupporterName.Base,
        registered: false,
        admin: false,
      };

      const [createdUser] = await db.insert(users).values(newUser).returning();

      this._dbData = createdUser;
      this._dbDataLoaded = true;
      this._hasChanges = false;

      logger.info(`Created user ${this.username} (${this.id}) in database`);
      return true;
    } catch (error) {
      throw new RealmError(`Failed to create user ${this.id} in database`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Saves any changes to the database. Only updates if there are actual changes AND the user exists in the database.
   *
   * @returns Promise resolving to true if saved successfully
   *
   * @example
   * ```typescript
   * if (await appUser.existsInDb()) {
   *   await appUser.save();
   * } // Only saves if there are changes
   * ```
   */
  async update(): Promise<boolean> {
    if (!(await this.existsInDb())) {
      return false;
    }

    if (!this.hasChanges()) {
      logger.debug(`No changes to save for user ${this.username} (${this.id})`);
      return true; // No changes to save
    }

    try {
      // Prepare update data - include Discord data that might have changed
      const updateData = {
        username: this.username,
        displayName: this.displayName,
        avatarUrl: this.displayAvatarURL(),
        supporter: this._dbData!.supporter,
        updatedAt: new Date(),
      };

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, this.id))
        .returning();

      if (!updatedUser) {
        throw new RealmError(`User ${this.id} not found when trying to save`, {
          location,
        });
      }

      this._dbData = updatedUser;
      this._hasChanges = false;

      logger.debug(`Saved changes for user ${this.username} (${this.id})`, {
        location,
      });
      return true;
    } catch (error) {
      throw new RealmError(`Failed to save user ${this.id}`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Updates the user's last active timestamp in the database.
   * This is a lightweight operation that doesn't require loading full user data.
   *
   * @returns Promise resolving to true if updated successfully
   *
   * @example
   * ```typescript
   * // Call this whenever the user interacts with the bot
   * await appUser.updateLastActive();
   * ```
   */
  async updateLastActive(): Promise<boolean> {
    if (!this.existsInDb()) {
      return false;
    }
    try {
      await db
        .update(users)
        .set({ lastActive: new Date() })
        .where(eq(users.id, this.id));

      // Update local data if loaded
      if (this._dbData) {
        this._dbData.lastActive = new Date();
      }

      logger.debug(
        `Updated last active for user ${this.username} (${this.id})`,
        { location }
      );
      return true;
    } catch (error) {
      throw new RealmError(`Failed to update last active for user ${this.id}`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Creates or updates the user in the database (upsert operation).
   * This is often the most convenient method for ensuring a user exists.
   *
   * @param options - Optional creation/update options
   * @returns Promise resolving to true if successful
   *
   * @example
   * ```typescript
   * // Ensure user exists and is up to date
   * await appUser.createOrUpdate({ registered: true });
   *
   * // Now safe to access database properties
   * if (appUser.isDbDataLoaded()) {
   *   console.log(`User: ${appUser.username}, Admin: ${appUser.isAdmin}`);
   * }
   * ```
   */
  async createOrUpdate(): Promise<boolean> {
    await this.existsInDb();
    if (this._dbData) {
      // User exists try and save
      return await this.update();
    } else {
      // User doesn't exist, create them
      return await this.createInDb();
    }
  }

  /**
   * Checks if there are unsaved changes to the database data.
   * This is useful to determine if save() needs to be called.
   *
   * @returns True if there are unsaved changes
   *
   * @throws RealmError if database data is not loaded
   *
   * @example
   * ```typescript
   * if (appUser.hasChanges()) {
   *   await appUser.save();
   * }
   * ```
   */
  hasChanges(): boolean {
    this.assertDbDataLoaded();
    if (
      this._dbData!.username !== this.username ||
      this._dbData!.displayName !== this.displayName ||
      this._dbData!.avatarUrl !== this.displayAvatarURL()
    ) {
      this._hasChanges = true;
    }
    return this._hasChanges;
  }

  // Synchronous getters that require data to be loaded (with TypeScript safety)

  /**
   * Gets whether the user is registered. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get isRegistered(): boolean {
    this.assertDbDataLoaded();
    return this._dbData!.registered;
  }

  /**
   * Gets whether the user is an admin. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get isAdmin(): boolean {
    this.assertDbDataLoaded();
    return this._dbData!.admin;
  }

  /**
   * Gets the user's email. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get email(): string | null {
    this.assertDbDataLoaded();
    return this._dbData!.email;
  }

  /**
   * Gets the user's supporter level. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get supporterLevel(): string {
    this.assertDbDataLoaded();
    return this._dbData!.supporter;
  }

  /**
   * Gets the user's last active timestamp. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get lastActive(): Date {
    this.assertDbDataLoaded();
    return this._dbData!.lastActive;
  }

  /**
   * Gets the user's creation timestamp. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  override get createdAt(): Date {
    this.assertDbDataLoaded();
    return this._dbData!.createdAt;
  }

  /**
   * Gets the user's last update timestamp. Only works if database data is already loaded.
   * Use the method `isDbDataLoaded()` to check or call `assertDbDataLoaded()` first.
   *
   * @throws RealmError if database data is not loaded
   */
  get updatedAt(): Date {
    this.assertDbDataLoaded();
    return this._dbData!.updatedAt;
  }

  // Setters that mark data as changed

  /**
   * Sets the user's supporter level and marks data as changed.
   * Call save() to persist changes to the database.
   *
   * @param level - The new supporter level
   * @throws RealmError if database data is not loaded
   */
  setSupporterLevel(level: SupporterName): void {
    this.assertDbDataLoaded();
    this._dbData!.supporter = level;
    this._hasChanges = true;
  }

  // Status getters

  /**
   * Gets the raw database data if loaded, null otherwise.
   * This is useful for accessing all data at once or checking if data exists.
   */
  get dbData(): UserDb | null {
    return this._dbData;
  }

  /**
   * Loads database data for this user. This method is idempotent - calling it multiple times
   * will only load the data once unless force is set to true.
   *
   * @param force - If true, forces a reload of the database data even if already loaded
   * @returns Promise that resolves when database data is loaded if no user exists returns false
   *
   * @example
   * ```typescript
   * const appUser = AppUser.from(discordUser);
   * await appUser.loadDbData();
   *
   * if (appUser.isDbDataLoaded()) {
   *   console.log(`User is registered: ${appUser.isRegistered}`);
   * }
   * ```
   */
  private async loadDbData(force = false): Promise<boolean> {
    if (this._dbDataLoaded && !force) {
      return true;
    }

    try {
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, this.id))
        .limit(1);

      this._dbData = userData || null;
      this._dbDataLoaded = true;

      if (userData) {
        logger.debug(
          `Loaded database data for user ${this.username} (${this.id})`
        );
      } else {
        logger.debug(
          `User ${this.username} (${this.id}) not found in database`
        );
      }
    } catch (error) {
      this._dbDataLoaded = false;
      this._dbData = null;
      throw new RealmError(`Failed to load database data for user ${this.id}`, {
        cause: error,
        location,
      });
    }
    return this._dbData !== null;
  }

  /**
   * Assertion function that throws if database data is not loaded.
   * This helps enforce that data is loaded before accessing it.
   *
   * @throws RealmError if database data is not loaded
   *
   * @example
   * ```typescript
   * await appUser.loadDbData();
   * appUser.assertDbDataLoaded(); // Throws if data failed to load
   * console.log(appUser.isAdmin); // Safe after assertion
   * ```
   */
  private assertDbDataLoaded(): void {
    if (!this._dbDataLoaded) {
      throw new RealmError(
        `Database data not loaded for user ${this.id}. Call loadDbData() first.`,
        { location }
      );
    }
  }
}

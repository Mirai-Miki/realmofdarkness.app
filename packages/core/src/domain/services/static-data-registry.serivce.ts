/**
 * Service to manage static game data definitions (Clans, Disciplines, Powers, etc.).
 * This is a placeholder implementation that will eventually load from MDX/JSON files.
 */
export class StaticDataRegistry {
  private static instance: StaticDataRegistry;
  private definitions: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): StaticDataRegistry {
    if (!StaticDataRegistry.instance) {
      StaticDataRegistry.instance = new StaticDataRegistry();
    }
    return StaticDataRegistry.instance;
  }

  public register(key: string, definition: any): void {
    this.definitions.set(key, definition);
  }

  public get<T>(key: string): T | undefined {
    return this.definitions.get(key) as T;
  }

  public has(key: string): boolean {
    return this.definitions.has(key);
  }
}

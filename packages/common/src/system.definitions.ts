export interface ISystemRepository {
  /**
   * Pings the database to check if it's healthy.
   *
   * @returns true if the connection is alive, false otherwise
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Represents a user on Discord
 */
module.exports = class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.createdAt = data.createdAt;
    this.supporter = data.supporter;
    this.avatarUrl = data.avatar_url;
  }

  get CreatedAt() {
    return null; // Create Datetime object
  }
};

"use strict";
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

/**
 * Deploys commands for a specific bot version (commands only, no emojis)
 */
async function deployCommands({
  version,
  environment = "dev",
  global = false,
  add = true,
}) {
  const normalizedVersion = version.toLowerCase();
  const upperVersion = normalizedVersion.toUpperCase();

  console.log("\n============================================================");
  console.log(
    `🚀  [DEPLOY] Deploying commands for bot version: \x1b[1m${version.toUpperCase()}\x1b[0m\n`
  );

  const clientId = process.env[`CLIENT_ID_${upperVersion}`];
  const token = process.env[`TOKEN_${upperVersion}`];
  const guildId = process.env.DEV_SERVER_ID;

  if (!clientId || !token) {
    console.error(`❌ [DEPLOY] Missing environment variables for ${version}`);
    return 0;
  }
  if (!global && !guildId) {
    console.error(
      "❌ [DEPLOY] Missing DEV_SERVER_ID environment variable for guild deployment"
    );
    return 0;
  }

  const commandPath = path.join(
    process.cwd(),
    "src",
    "commands",
    normalizedVersion
  );
  if (!fs.existsSync(commandPath)) {
    console.error(`❌ [DEPLOY] Command directory not found: ${commandPath}`);
    return 0;
  }

  const commands = [];
  if (add) {
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
    if (commandFiles.length === 0) {
      console.warn(`No command files found for ${version}`);
      return 0;
    }
    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandPath, file));
        if (command.data) {
          commands.push(command.data);
          console.log(`Loaded ${file}: ${command.data.name}`);
        }
      } catch (error) {
        console.error(`Failed to load command from ${file}:`, error);
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    const targetRoute = global
      ? Routes.applicationCommands(clientId)
      : Routes.applicationGuildCommands(clientId, guildId);

    if (!global && environment === "dev" && add) {
      console.log("\nClearing global commands to avoid duplicates...");
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
    }
    if (global && environment === "dev" && add) {
      console.log("\nClearing guild-specific commands to avoid duplicates...");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [],
      });
    }

    const response = await rest.put(targetRoute, { body: commands });
    const deploymentType = add ? "registered" : "removed";
    const scopeType = global ? "globally" : "for development server";
    if (add) {
      console.log(
        `\n🚀 Successfully ${deploymentType} ${response.length} ${version} commands ${scopeType}`
      );
    } else {
      console.log(
        `\n🚀 Successfully ${deploymentType} all ${version} commands ${scopeType}`
      );
    }
    console.log(
      "============================================================\n"
    );

    return add ? response.length : 1;
  } catch (error) {
    console.error(`❌ [DEPLOY] Failed to deploy ${version} commands:`, error);
    return 0;
  } finally {
    // Add a small delay to prevent Discord API rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const version = args[0];
  const mode = args[1] || "dev";
  if (!version) {
    console.error("Please provide a bot version: 5th, 20th, or cod");
    process.exit(1);
  }
  const options = { version };
  switch (mode) {
    case "dev":
      options.environment = "dev";
      options.global = false;
      options.add = true;
      break;
    case "dev-global":
      options.environment = "dev";
      options.global = true;
      options.add = true;
      break;
    case "prod":
      options.environment = "prod";
      options.global = true;
      options.add = true;
      break;
    case "clear-dev":
      options.environment = "dev";
      options.global = false;
      options.add = false;
      break;
    case "clear-global":
      options.environment = "";
      options.global = true;
      options.add = false;
      break;
    default:
      console.error(
        "Invalid mode. Use: dev, dev-global, prod, clear-dev, clear-global, or clear-prod"
      );
      process.exit(1);
  }
  (async () => {
    await deployCommands(options);
  })();
} else {
  module.exports = deployCommands;
}

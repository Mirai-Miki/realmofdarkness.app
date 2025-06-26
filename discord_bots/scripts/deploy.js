"use strict";
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

/**
 * Deploys commands for a specific bot version
 * @param {Object} options - Deployment options
 * @param {string} options.version - Bot version (5th, 20th, cod)
 * @param {string} options.environment - Target environment (dev, prod)
 * @param {boolean} options.global - Whether to deploy globally
 * @param {boolean} options.add - Whether to add (true) or remove (false) commands
 * @returns {Promise<number>} - Number of commands processed
 */
async function deployCommands({
  version,
  environment = "dev",
  global = false,
  add = true,
}) {
  // Normalize version string
  const normalizedVersion = version.toLowerCase();
  const upperVersion = normalizedVersion.toUpperCase();

  // Get environment variables
  const clientId = process.env[`CLIENT_ID_${upperVersion}`];
  const token = process.env[`TOKEN_${upperVersion}`];
  const guildId = process.env.DEV_SERVER_ID;

  if (!clientId || !token) {
    console.error(`Missing environment variables for ${version}`);
    return 0;
  }

  if (!global && !guildId) {
    console.error(
      "Missing DEV_SERVER_ID environment variable for guild deployment"
    );
    return 0;
  }

  // Command path
  const commandPath = path.join(
    process.cwd(),
    "src",
    "commands",
    normalizedVersion
  );

  if (!fs.existsSync(commandPath)) {
    console.error(`Command directory not found: ${commandPath}`);
    return 0;
  }

  // Read command files only if we're adding commands
  const commands = [];

  if (add) {
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    if (commandFiles.length === 0) {
      console.warn(`No command files found for ${version}`);
      return 0;
    }

    // Load each command
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

  // Setup REST API client
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    const targetRoute = global
      ? Routes.applicationCommands(clientId)
      : Routes.applicationGuildCommands(clientId, guildId);

    // CASE 1: Switching from global to guild in dev mode
    // If deploying to guild only AND in dev mode, clear any global commands first
    if (!global && environment === "dev" && add) {
      console.log("Clearing global commands to avoid duplicates...");
      // Clear global commands for this app
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
    }

    // CASE 2: Switching from guild to global in dev mode
    // If clearing commands in dev server but deploying globally,
    // clear guild commands first to avoid duplicates
    if (global && environment === "dev" && add) {
      console.log("Clearing guild-specific commands to avoid duplicates...");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [],
      });
    }

    const response = await rest.put(targetRoute, { body: commands });

    const deploymentType = add ? "registered" : "removed";
    const scopeType = global ? "globally" : "for development server";

    // Use different message format for command removal vs. addition
    if (add) {
      console.log(
        `Successfully ${deploymentType} ${response.length} ${version} commands ${scopeType}`
      );
    } else {
      console.log(
        `Successfully ${deploymentType} all ${version} commands ${scopeType}`
      );
    }

    return add ? response.length : 1; // Return 1 for successful clearing operations
  } catch (error) {
    console.error(`Failed to deploy ${version} commands:`, error);
    return 0;
  }
}

// Allow script to be run directly or imported
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const version = args[0];
  const mode = args[1] || "dev"; // dev, dev-global, prod, clear-dev, clear-global, clear-prod

  if (!version) {
    console.error("Please provide a bot version: 5th, 20th, or cod");
    process.exit(1);
  }

  // Parse deployment options based on mode
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

  // Execute deployment
  (async () => {
    console.log(`Starting command deployment (${mode}) for ${version}...`);
    await deployCommands(options);
    console.log("Command deployment completed.");
  })();
} else {
  module.exports = deployCommands;
}

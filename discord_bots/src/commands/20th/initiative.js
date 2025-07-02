"use strict";
require(`${process.cwd()}/alias`);
const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { RealmError, ErrorCodes } = require("@errors");
const canSendMessage = require("@modules/canSendMessage");
const getButtonRow = require("@modules/Initiative/getButtonRow");
const API = require("@api");
const InitiativeTracker = require("@structures/InitiativeTracker");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");
const { Splats } = require("@constants");

/**
 * Initiative tracking command for 20th anniversary edition games
 * Handles combat initiative tracking, rolling, and management
 *
 * Provides subcommands for:
 * - Creating a new initiative tracker
 * - Rolling initiative for characters
 * - Joining an existing round of initiative
 * - Re-rolling initiative for characters
 * - Declaring actions during combat
 * - Reposting the initiative tracker
 */
module.exports = {
  // Command definition data
  data: getCommand(),

  /**
   * Execute the initiative command based on the subcommand
   * @param {CommandInteraction} interaction - The Discord interaction object
   * @returns {Promise<Object>} Response to send to Discord
   */
  async execute(interaction) {
    // Defer the reply to allow for processing time
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await commandUpdate(interaction);

    // Ensure we can reply to the interaction
    if (!interaction.isRepliable()) return "notRepliable";

    // Get the channel and check for an existing initiative tracker
    const channel = await getChannel(interaction);
    let tracker = await API.getInitTracker(channel.id);

    // Process the appropriate subcommand
    switch (interaction.options.getSubcommand()) {
      case "new":
        // Create a new initiative tracker
        if (tracker) {
          // If a tracker already exists, ask for confirmation before replacing it
          return {
            embeds: [
              new EmbedBuilder()
                .setTitle("Start New Initiative?")
                .setDescription(
                  "There is still an active tracker in this channel " +
                    "would you still like to create a new one?\n" +
                    "Note starting a new tracker will end the old one."
                )
                .setColor("#c914cc"),
            ],
            components: [getButtonRow.confirmNewTracker],
          };
        }

        // Create and initialize a new tracker
        tracker = new InitiativeTracker({
          channelId: channel.id,
          guildId: interaction.guild.id,
          startMemberId: interaction.member.id,
        });
        return await tracker.rollPhase(interaction);

      case "roll":
        // Roll initiative for a character
        if (!tracker) throw new RealmError({ code: ErrorCodes.InitNoTracker });
        return await tracker.characterRoll(interaction);

      case "join":
        // Join an existing initiative round
        if (!tracker) throw new RealmError({ code: ErrorCodes.InitNoTracker });
        return await tracker.characterJoin(interaction);

      case "reroll":
        // Re-roll initiative for a character
        if (!tracker) throw new RealmError({ code: ErrorCodes.InitNoTracker });
        return await tracker.characterRoll(interaction, true);

      case "declare":
        // Declare an action for a character
        if (!tracker) throw new RealmError({ code: ErrorCodes.InitNoTracker });
        return await tracker.characterDeclare(interaction);

      case "repost":
        // Repost the initiative tracker message
        if (!tracker) throw new RealmError({ code: ErrorCodes.InitNoTracker });
        return await tracker.repost(interaction);
    }
  },

  /**
   * Provide autocomplete suggestions for character names
   * @param {AutocompleteInteraction} interaction - The Discord autocomplete interaction
   * @returns {Promise<Array>} Autocomplete choices for character names
   */
  async autocomplete(interaction) {
    // Return character suggestions from supported 20th edition splats
    return await autocomplete20th(interaction, [
      Splats.vampire20th.slug,
      Splats.human20th.slug,
      Splats.ghoul20th.slug,
      Splats.changeling20th.slug,
      Splats.demonTF.slug,
      Splats.mage20th.slug,
      Splats.werewolf20th.slug,
      Splats.wraith20th.slug,
    ]);
  },
};

/**
 * Validates the channel for the initiative tracker
 * @param {CommandInteraction} interaction - The Discord interaction object
 * @returns {TextChannel} The validated Discord channel
 * @throws {RealmError} If channel is invalid or lacks permissions
 */
async function getChannel(interaction) {
  // Ensure the command is used in a guild
  if (!interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });

  // Check if the bot can send messages in this channel
  const channel = await canSendMessage({ channel: interaction.channel });
  if (!channel)
    throw new RealmError({ code: ErrorCodes.InvalidChannelPermissions });

  return channel;
}

/**
 * Creates and configures the initiative command structure
 * @returns {SlashCommandBuilder} The configured command builder
 */
function getCommand() {
  return (
    new SlashCommandBuilder()
      .setName("init")
      .setDescription("Manage initiative tracking for combat.")

      ////////////////////// New Init Command ////////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("new")
          .setDescription("Start a new initiative tracker in this channel.")
      )

      ///////////////////// Roll Init Command /////////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("roll")
          .setDescription("Roll initiative for your character.")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the character rolling initiative.")
              .setMaxLength(50)
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("dex_wits")
              .setDescription("Dexterity + Wits total (1-100).")
              .setMaxValue(100)
              .setMinValue(1)
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("modifier")
              .setDescription("Initiative bonus or penalty (-50 to 50).")
              .setMaxValue(50)
              .setMinValue(-50)
          )
          .addIntegerOption((option) =>
            option
              .setName("extra_actions")
              .setDescription("Number of extra actions (1-5).")
              .setMaxValue(5)
              .setMinValue(1)
          )
      )

      ////////////////////// Reroll Init Command //////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("reroll")
          .setDescription("Reroll initiative for your character.")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the character rerolling initiative.")
              .setMaxLength(50)
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("modifier")
              .setDescription("Initiative bonus or penalty (-50 to 50).")
              .setMaxValue(50)
              .setMinValue(-50)
          )
          .addIntegerOption((option) =>
            option
              .setName("extra_actions")
              .setDescription("Number of extra actions (1-5).")
              .setMaxValue(5)
              .setMinValue(1)
          )
      )

      /////////////////////// Declare Init Command ////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("declare")
          .setDescription("Declare your action for this turn.")
          .addStringOption((option) =>
            option
              .setName("action")
              .setDescription("Describe the action you will take this turn.")
              .setMaxLength(150)
              .setRequired(true)
          )
      )

      ///////////////////////// Repost Init Command ///////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("repost")
          .setDescription(
            "Repost the current initiative tracker to this channel."
          )
      )

      ///////////////////// Join Init Command ////////////////////////////////
      .addSubcommand((subcommand) =>
        subcommand
          .setName("join")
          .setDescription(
            "Join the current round with the same initiative value."
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the character joining the round.")
              .setMaxLength(50)
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("extra_actions")
              .setDescription("Number of extra actions (1-5).")
              .setMaxValue(5)
              .setMinValue(1)
          )
      )
  );
}

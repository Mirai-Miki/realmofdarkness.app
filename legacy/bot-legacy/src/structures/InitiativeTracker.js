"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { Collection, EmbedBuilder } = require("discord.js");
const { RealmError, ErrorCodes } = require("@errors");
const InitiativeCharacter = require("./InitiativeCharacter");
const { getInitiativeButtonRow } = require("@modules/Initiative/getButtonRow");
const { InitPhase } = require("@constants");
const getCharacter = require("@src/modules/getCharacter");

/**
 * Initiative Tracker - Manages combat initiative for characters
 *
 * Handles all phases of initiative tracking:
 * - Rolling for initiative
 * - Revealing initiative order
 * - Declaring actions in initiative order
 * - Taking actions
 * - Starting new rounds
 */
module.exports = class InitiativeTracker {
  /**
   * Create a new initiative tracker
   * @param {Object} options - Tracker initialization options
   * @param {String} options.channelId - Discord channel ID where the tracker will be posted
   * @param {String} options.guildId - Discord guild ID
   * @param {String} options.startMemberId - Member ID who started this tracker
   * @param {Object} options.json - JSON representation to deserialize from
   */
  constructor({
    channelId = null,
    guildId = null,
    startMemberId = null,
    json = null,
  } = {}) {
    // Initialize tracker properties
    this.phase = InitPhase.ROLL;
    this.channelId = channelId;
    this.guildId = guildId;
    this.messageId = null;
    this.startMemberId = startMemberId;

    // Character collections and actions
    this.characters = new Collection();
    this.actions = [];
    this.round = 0;
    this.tag = null;

    // Deserialize if JSON is provided
    if (json) this.deserialize(json);
  }

  //////////////////////////// COMMAND INTERACTIONS ///////////////////////////

  /**
   * Handle a character rolling for initiative
   * @param {Interaction} interaction - Discord interaction
   * @param {Boolean} reroll - Whether this is a reroll
   * @returns {Object} Response to send to Discord
   */
  async characterRoll(interaction, reroll = false) {
    // Validate we're in the correct phase
    if (this.phase > InitPhase.ROLL2) {
      throw new RealmError({ code: ErrorCodes.InitInvalidPhase });
    }

    // Get character info from interaction
    const autocomplete = await getCharacter(
      interaction.options.getString("name"),
      interaction,
      false // Character not required
    );
    const name = autocomplete.name;
    let dexWits = interaction.options.getInteger("dex_wits");
    let modifier = interaction.options.getInteger("modifier") ?? 0;
    let extraActions = interaction.options.getInteger("extra_actions") ?? 0;

    // Look up if the character is already in this initiative
    let character = this.characters.get(
      `${interaction.user.id}|${name.toLowerCase()}`
    );

    // Handle various roll scenarios
    if (character && this.phase <= InitPhase.JOIN2) {
      // If character exists and we're in JOIN phase, redirect to join
      return await this.characterJoin(interaction);
    } else if (reroll && !character) {
      // Can't reroll for character that doesn't exist
      throw new RealmError({ code: ErrorCodes.InitNoCharacter });
    } else if (reroll) {
      // Rerolling for existing character - keep some existing values
      dexWits = character.dexWits;
      modifier =
        interaction.options.getInteger("modifier") ?? character.modifier;
      extraActions =
        interaction.options.getInteger("extra_actions") ??
        character.extraActions;
    } else if (!character) {
      // New character for this initiative
      character = new InitiativeCharacter({
        name: name,
        memberId: interaction.member.id,
      });
    }

    // Roll initiative for the character and store in collection
    character.rollInitiative(dexWits, modifier, extraActions);
    this.characters.set(
      `${interaction.user.id}|${name.toLowerCase()}`,
      character
    );

    // Build response message
    let mod = "";
    if (character.modifier) mod = ` and a modifier of <${character.modifier}>`;
    let actionMess = "";
    if (character.extraActions)
      actionMess = `You will also get ${character.extraActions} extra actions.\n`;

    // Check if we should advance to ROLL2 phase (when at least 2 characters have joined)
    if (this.phase != InitPhase.ROLL2) {
      let joined = 0;
      for (const character of this.characters.values()) {
        if (character.joinedRound) joined++;
      }
      if (joined >= 2) this.phase = InitPhase.ROLL2;
    }

    await this.post(interaction.client);

    return {
      content:
        `You have rolled with a Dex+Wits of <${character.dexWits}>${mod}\n` +
        actionMess +
        "If this is not correct please reroll before everyone is ready!",
      embeds: [],
      components: [],
    };
  }

  /**
   * Handle a character joining an existing initiative round
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async characterJoin(interaction) {
    // Validate we're in the correct phase
    if (this.phase !== InitPhase.JOIN2 && this.phase !== InitPhase.JOIN) {
      throw new RealmError({ code: ErrorCodes.InitInvalidPhase });
    }

    // Get character info from interaction
    const autocomplete = await getCharacter(
      interaction.options.getString("name"),
      interaction,
      false // Character not required
    );
    const name = autocomplete.name;

    // Look up the character in this initiative
    let character = this.characters.get(
      `${interaction.user.id}|${name.toLowerCase()}`
    );

    if (!character) throw new RealmError({ code: ErrorCodes.InitNoCharacter });

    // Update character properties and mark as joined
    character.extraActions =
      interaction.options.getInteger("extra_actions") ?? character.extraActions;
    character.joinedRound = true;

    // Build response message
    let actionMess = "";
    if (character.extraActions)
      actionMess = `You will also get ${character.extraActions} extra actions.\n`;

    // Check if we should advance to JOIN2 phase (when at least 2 characters have joined)
    if (this.phase !== InitPhase.JOIN2) {
      let joined = 0;
      for (const character of this.characters.values()) {
        if (character.joinedRound) joined++;
      }
      if (joined >= 2) this.phase = InitPhase.JOIN2;
    }
    await this.post(interaction.client);

    return {
      content:
        `You have rejoined this round with <${character.name}>\n` + actionMess,
      embeds: [],
      components: [],
    };
  }

  /**
   * Handle a character declaring an action
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async characterDeclare(interaction) {
    // Validate we're in the correct phase
    if (this.phase !== InitPhase.DECLARE)
      throw new RealmError({ code: ErrorCodes.InitInvalidPhase });

    // Look through action order to find current character's turn
    let currentChar;
    let nextChar = null;
    for (const order of this.actions) {
      const character = this.characters.get(order.id);
      if (!currentChar && !order.action) {
        // Found the current turn - verify it's this user's turn
        if (character.memberId != interaction.member.id)
          throw new RealmError({ code: ErrorCodes.InitInvalidTurn });

        // Record the action
        currentChar = character;
        order.action = interaction.options.getString("action");
      } else if (currentChar) {
        // Found the next character in order
        nextChar = character;
        this.tag = `<@${nextChar.memberId}>`;
        break;
      }
    }

    // If there are no more characters, advance to DECLARED phase
    if (!nextChar) this.phase = InitPhase.DECLARED;
    this.post(interaction.client);

    return {
      content: "Your action has been declared!",
      embeds: [],
      components: [],
    };
  }

  /**
   * Repost the tracker message
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async repost(interaction) {
    await this.post(interaction.client);
    return { content: "Ready to go!", embeds: [], components: [] };
  }

  ////////////////////////// BUTTON INTERACTIONS //////////////////////////////

  /**
   * Transition to Roll phase, resetting for a new round
   * @param {Interaction} interaction - Discord interaction
   * @param {Boolean} join - Whether to go to JOIN phase instead of ROLL
   * @returns {Object} Response to send to Discord
   */
  async rollPhase(interaction, join = false) {
    // Set appropriate phase
    this.phase = InitPhase.ROLL;
    if (join) this.phase = InitPhase.JOIN;

    // Increment round counter and reset actions
    this.round++;
    this.actions = [];

    // Reset all characters for new round
    for (const character of this.characters.values()) {
      character.newRound();
    }

    await this.post(interaction.client);
    return { content: "Ready to go!", embeds: [], components: [] };
  }

  /**
   * Transition to Reveal phase, showing initiative order
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async revealPhase(interaction) {
    this.phase = InitPhase.REVEAL;
    await this.post(interaction.client);
    return { content: "Ready to go!", embeds: [], components: [] };
  }

  /**
   * Transition to Declare phase, setting up action order
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async declarePhase(interaction) {
    this.phase = InitPhase.DECLARE;

    // Sort characters by initiative descending
    this.characters.sort(sortInitAscending);

    // Add normal actions in reverse initiative order
    for (const character of this.characters.values()) {
      if (!character.joinedRound) continue;
      this.actions.unshift({
        id: character.memberId + "|" + character.name.toLowerCase(),
        action: null,
      });
    }

    // Add extra actions for characters that have them
    for (const character of this.characters.values()) {
      if (!character.joinedRound) continue;
      let extraActions = character.extraActions;
      for (extraActions; extraActions > 0; extraActions--) {
        this.actions.unshift({
          id: character.memberId + "|" + character.name.toLowerCase(),
          action: null,
        });
      }
    }

    // Tag the first player whose turn it is
    const character = this.characters.get(this.actions[0].id);
    this.tag = `<@${character.memberId}>`;

    await this.post(interaction.client);
    return { content: "Ready to go!", embeds: [], components: [] };
  }

  /**
   * Transition to Declared phase (all actions declared)
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async declaredPhase(interaction) {
    this.phase = InitPhase.DECLARED;
    await this.post(interaction.client);
    return {
      content: "Your action has been declared!",
      embeds: [],
      components: [],
    };
  }

  /**
   * Transition to Join phase for a new round
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async joinPhase(interaction) {
    this.phase = InitPhase.JOIN;
    this.round++;

    // Reset character states for new round
    for (const character of this.characters.values()) {
      character.joinedRound = false;
      character.extraActions = 0;
      character.declared = false;
      character.action = null;
    }

    await this.post(interaction.client);
    return { content: "Ready to go!", embeds: [], components: [] };
  }

  /**
   * Skip the current character's action
   * @param {Interaction} interaction - Discord interaction
   * @returns {Object} Response to send to Discord
   */
  async skipAction(interaction) {
    // Find current action and mark as skipped
    let currentChar;
    let nextChar = null;
    for (const order of this.actions) {
      const character = this.characters.get(order.id);
      if (!currentChar && !order.action) {
        // Found current action, mark as skipped
        currentChar = character;
        order.action = "Skipped";
      } else if (currentChar) {
        // Found next character in order
        nextChar = character;
        this.tag = `<@${nextChar.memberId}>`;
        break;
      }
    }

    // If there are no more characters, advance to DECLARED phase
    if (!nextChar) this.phase = InitPhase.DECLARED;
    this.post(interaction.client);

    return { content: "The action was skipped", embeds: [], components: [] };
  }

  ///////////////////////////// UTILITY METHODS //////////////////////////////

  /**
   * Save the tracker state to database
   * @returns {Promise<void>}
   */
  async save() {
    await API.setInitTracker(this.channelId, this.guildId, this.serialize());
  }

  /**
   * Post or update the tracker message in the channel
   * @param {Client} client - Discord client
   * @returns {Promise<void>}
   */
  async post(client) {
    // Get the channel
    const channel = await client.channels.fetch(this.channelId);

    // Try to fetch previous message
    let oldMessage;
    try {
      if (this.messageId)
        oldMessage = await channel.messages.fetch(this.messageId);
    } catch (error) {
      oldMessage = null;
    }

    // Create response with embed and buttons
    const response = {
      content: null,
      embeds: [await getTrackerEmbed(this, channel.guild.members)],
      components: [getInitiativeButtonRow(this.phase)],
    };

    // Add mention tag for current player if in declare phase
    if (this.phase === InitPhase.DECLARE) response.content = this.tag;

    // Send new message
    const message = await channel.send(response);
    this.messageId = message.id;

    // Save tracker state
    try {
      await this.save();
    } catch (error) {
      // Delete message if save fails
      message.delete();
      throw error;
    }

    // Delete old message if it exists
    if (oldMessage) oldMessage.delete();
  }

  /**
   * Convert tracker to serializable object
   * @returns {Object} Serialized tracker
   */
  serialize() {
    const characters = [];
    this.characters.forEach((character) => {
      characters.push(character.serialize());
    });

    return {
      phase: this.phase,
      channel_id: this.channelId,
      guild_id: this.guildId,
      message_id: this.messageId,
      start_member_id: this.startMemberId,
      round: this.round,
      characters: characters,
      actions: this.actions,
      tag: this.tag,
    };
  }

  /**
   * Reconstruct tracker from serialized object
   * @param {Object} json - Serialized tracker data
   */
  deserialize(json) {
    // Restore tracker properties
    this.phase = json.phase;
    this.channelId = json.channel_id;
    this.guildId = json.guild_id;
    this.messageId = json.message_id;
    this.startMemberId = json.start_member_id;
    this.round = json.round;
    this.actions = json.actions;
    this.tag = json.tag;

    // Reconstruct characters
    for (const character of json.characters) {
      this.characters.set(
        `${character.member_id}|${character.name.toLowerCase()}`,
        new InitiativeCharacter({ json: character })
      );
    }
  }
};

////////////////////////////////// HELPER FUNCTIONS //////////////////////////

/**
 * Sort function for initiative order (descending)
 * @param {InitiativeCharacter} a - First character to compare
 * @param {InitiativeCharacter} b - Second character to compare
 * @returns {Number} Sort order (-1, 0, 1)
 */
function sortInitAscending(a, b) {
  if (a.initiative > b.initiative) return -1;
  else if (a.initiative === b.initiative) {
    // Handle ties with Dex+Wits+Modifier
    if (a.dexWits + a.modifier > b.dexWits + b.modifier) return -1;
    else if (a.dexWits + a.modifier === b.dexWits + b.modifier) return 0;
    else return 1;
  } else return 1;
}

/////////////////////////////// EMBED FUNCTIONS ///////////////////////////////

/**
 * Create the embed for the tracker
 * @param {InitiativeTracker} tracker - The tracker to create embed for
 * @param {GuildMemberManager} members - Guild members to fetch display names
 * @returns {EmbedBuilder} The created embed
 */
async function getTrackerEmbed(tracker, members) {
  // Get title, description and color based on current phase
  const info = getTrackerEmbedInfo(tracker);
  const embed = new EmbedBuilder()
    .setTitle(info.title)
    .setDescription(info.description)
    .setColor(info.color);

  // The embed content differs based on the phase
  if (tracker.phase <= InitPhase.ROLL2) {
    // ROLL phase: Show who has rolled
    for (const character of tracker.characters.values()) {
      if (!character.joinedRound) continue;

      const member = await members.fetch(character.memberId);
      embed.addFields({
        name: `${character.name} (${member.displayName})`,
        value: "Ready! ✅",
      });
    }
  } else if (tracker.phase === InitPhase.REVEAL) {
    // REVEAL phase: Show initiative order with values
    let count = 1;
    tracker.characters.sort(sortInitAscending);

    for (const character of tracker.characters.values()) {
      if (!character.joinedRound) continue;
      const member = await members.fetch(character.memberId);

      let mod = "";
      if (character.modifier) mod = `Modifier(${character.modifier}) +`;

      let extraActions = "";
      if (character.extraActions)
        extraActions = `\nExtra Action: ${character.extraActions}`;

      embed.addFields({
        name: `#${count} - ${character.name} ` + `(${member.displayName})`,
        value:
          `||Dex+Wits(${character.dexWits}) + ${mod} 1d10(${character.d10})||` +
          `\nInitiative of: ${character.initiative}` +
          extraActions,
      });
      count++;
    }
  } else if (tracker.phase >= InitPhase.DECLARE) {
    // DECLARE/DECLARED phase: Show action declarations
    const fields = [];
    let current = false;

    for (const order of tracker.actions) {
      const character = tracker.characters.get(order.id);
      const member = await members.fetch(character.memberId);
      if (!character.joinedRound) continue;

      // Format field value based on action status
      let value = "";
      if (order.action) value = order.action;
      else if (!order.action && !current) {
        value = "📍 Please decalare your action!";
        current = true;
      } else value = "Undeclared";

      // Add field to beginning of array (reverse order)
      fields.unshift({
        title: `${character.name} (${member.displayName})`,
        value: value,
      });
    }

    // Add all fields to embed
    for (const field of fields) {
      embed.addFields({ name: field.title, value: field.value });
    }
  }
  return embed;
}

/**
 * Get appropriate title, description and color for the tracker embed based on phase
 * @param {InitiativeTracker} tracker - The tracker to get info for
 * @returns {Object} Object with title, description and color
 */
function getTrackerEmbedInfo(tracker) {
  // Add round number to title if beyond first round
  let round = "";
  if (tracker.round > 1) round = `Turn: ${tracker.round} |`;

  // Return appropriate info based on phase
  switch (tracker.phase) {
    case InitPhase.ROLL:
    case InitPhase.ROLL2:
      return {
        title: `${round} Roll for Initiative!`,
        description:
          "Please use the `/init roll` command " +
          "to roll for Initiative.\nWhen everone has rolled, press the " +
          "(Reveal Initiative) button" +
          "\n----------------------------------",
        color: "#c41d71",
      };
    case InitPhase.REVEAL:
      return {
        title: `${round} Initiative Order!`,
        description: "----------------------------------",
        color: "#c41d71",
      };
    case InitPhase.DECLARE:
      return {
        title: `${round} Declare Actions!`,
        description:
          "Please use the `/init declare` command " +
          "to declare your actions.\nActions are declared in " +
          "descending order of Initiative. You can only declare " +
          "on your turn!\n----------------------------------",
        color: "#c41d71",
      };
    case InitPhase.DECLARED:
      return {
        title: `${round} Take your actions!!`,
        description:
          "Actions are taken in order of " +
          "Initiative.\nWhen all actions have been taken " +
          "click the (Next Round) button to move into another " +
          "round or (End Initiative) if you are finished combat" +
          "\n----------------------------------",
        color: "#96150c",
      };
    case InitPhase.JOIN:
    case InitPhase.JOIN2:
      return {
        title: `${round} Join the next round!`,
        description:
          "Initiative order will be the same as last round. " +
          "\nIf you were in the last round you can join this round with the " +
          "`/init join` command. If you are just joining the fight you can " +
          "use the `/init roll` command." +
          "\n----------------------------------",
        color: "#96150c",
      };
  }
}

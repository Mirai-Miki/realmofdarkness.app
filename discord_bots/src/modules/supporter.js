"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder, MessageFlags } = require("discord.js");
const Supporter = require("@src/constants/Supporter");
const AppMember = require("@structures/AppMember");
const AppUser = require("@structures/AppUser");
const { Emoji } = require("@constants");

/**
 * Create a visual progress bar for display
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @returns {string} - Progress bar string
 */

function createProgressBar(current, max) {
  const barLength = 10;
  const percentage = max > 0 ? Math.min(current / max, 1) : 0;
  const filledBars = Math.floor(percentage * barLength);

  // Choose color set
  let color = "green";
  if (percentage > 0.9) color = "red";
  else if (percentage > 0.5) color = "yellow";

  // Emoji keys for each color
  const keys = {
    green: {
      left_full: Emoji.bar_g_filled_left.toString(),
      left_empty: Emoji.bar_g_empty_left.toString(),
      middle_full: Emoji.bar_g_filled_middle.toString(),
      middle_empty: Emoji.bar_g_empty_middle.toString(),
      right_full: Emoji.bar_g_filled_right.toString(),
      right_empty: Emoji.bar_g_empty_right.toString(),
    },
    yellow: {
      left_full: Emoji.bar_y_filled_left.toString(),
      left_empty: Emoji.bar_y_empty_left.toString(),
      middle_full: Emoji.bar_y_filled_middle.toString(),
      middle_empty: Emoji.bar_y_empty_middle.toString(),
      right_full: Emoji.bar_y_filled_right.toString(),
      right_empty: Emoji.bar_y_empty_right.toString(),
    },
    red: {
      left_full: Emoji.bar_r_filled_left.toString(),
      left_empty: Emoji.bar_r_empty_left.toString(),
      middle_full: Emoji.bar_r_filled_middle.toString(),
      middle_empty: Emoji.bar_r_empty_middle.toString(),
      right_full: Emoji.bar_r_filled_right.toString(),
      right_empty: Emoji.bar_r_empty_right.toString(),
    },
  };
  const set = keys[color];
  let bar = "";
  for (let i = 0; i < barLength; i++) {
    if (i === 0) {
      bar += i < filledBars ? set.left_full : set.left_empty;
    } else if (i === barLength - 1) {
      bar += i < filledBars ? set.right_full : set.right_empty;
    } else {
      bar += i < filledBars ? set.middle_full : set.middle_empty;
    }
  }
  return `${bar} ${Math.round(percentage * 100)}%`;
}

/**
 * Handle the supporter status command
 * @param {CommandInteraction} interaction - Discord interaction object
 * @returns {Object} - Discord response object
 */
async function supporterStatus(interaction) {
  let appUser = null;
  let appMember = null;

  if (interaction.member) {
    appMember = new AppMember(interaction.client);
    await appMember.fetch(interaction.member);
    appUser = appMember.appUser;
  } else {
    appUser = new AppUser(interaction.client);
    await appUser.fetch(interaction.user);
  }

  // Get character counts
  let characterCounts;
  if (appMember) {
    characterCounts = await appMember.loadCharacterCount();
  } else {
    characterCounts = await appUser.loadCharacterCount();
  }

  // Get the user's supporter level
  const supporterLevel = appUser.supporter;
  const tierName = Supporter.getName(supporterLevel);
  const tierEmoji = Supporter.getEmoji(supporterLevel);

  // Get limits
  const sheetLimit = Supporter.getSheetLimit(supporterLevel);
  const trackerLimit = Supporter.getTrackerLimit(supporterLevel);

  // Determine embed color based on tier
  const embedColor = Supporter.getColor(supporterLevel);

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`Tier: ${tierName} ${tierEmoji}`)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setURL("https://www.patreon.com/MiraiMiki");

  // Global character info
  const globalSheets = characterCounts.global.sheets;
  const globalTrackers = characterCounts.global.trackers;
  const globalTotal = characterCounts.global.total;

  // Create progress bars for sheets and trackers
  const sheetProgress = createProgressBar(globalSheets, sheetLimit);
  const trackerProgress = createProgressBar(globalTrackers, trackerLimit);

  embed.addFields({
    name: "📄 Character Sheets",
    value: `${globalSheets}/${sheetLimit}\n${sheetProgress}`,
    inline: false,
  });

  embed.addFields({
    name: "📝 Character Trackers",
    value: `${globalTrackers}/${trackerLimit}\n${trackerProgress}`,
    inline: false,
  });

  embed.addFields({
    name: "📊 Total Characters",
    value: `\`\`\`\n${globalTotal}\`\`\``,
    inline: false,
  });

  // Add server-specific info if in a guild
  if (interaction.guild && characterCounts.chronicle) {
    const serverSheets = characterCounts.chronicle.sheets;
    const serverTrackers = characterCounts.chronicle.trackers;
    const serverTotal = characterCounts.chronicle.total;

    embed.addFields({
      name: `🏠 ${interaction.guild.name}`,
      value: `• Sheets: ${serverSheets}\n• Trackers: ${serverTrackers}\n• Total: ${serverTotal}`,
      inline: false,
    });
  }

  // Add upgrade info
  const patreonLink = "[Patreon](https://www.patreon.com/MiraiMiki)";
  embed.addFields({
    name: "💎 Upgrade Your Membership",
    value: `Support the project and unlock more features on ${patreonLink}!`,
    inline: false,
  });

  // Add footer with useful links
  embed.setFooter({
    text: "Thank you for your support!",
    iconURL: interaction.client.user.displayAvatarURL(),
  });

  return {
    flags: MessageFlags.Ephemeral,
    embeds: [embed],
  };
}

/**
 * Handle the supporter join command
 * @param {CommandInteraction} interaction - Discord interaction object
 * @returns {Object} - Discord response object
 */
async function supporterJoin(interaction) {
  const embed = new EmbedBuilder()
    .setColor("#FF424D")
    .setTitle("💎 Become a Supporter!")
    .setDescription(
      "Support the Realm of Darkness project and unlock amazing features!"
    )
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setURL("https://www.patreon.com/MiraiMiki");

  // Add tier information
  embed.addFields(
    {
      name: `${Supporter.getEmoji(Supporter.free)} ${Supporter.getName(Supporter.free)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.free)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.free)} Character Trackers\n• All basic functionality and features`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.mortal)} ${Supporter.getName(Supporter.mortal)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.mortal)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.mortal)} Character Trackers\n• Custom bot colors & images`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.fledgling)} ${Supporter.getName(Supporter.fledgling)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.fledgling)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.fledgling)} Character Trackers`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.neonate)} ${Supporter.getName(Supporter.neonate)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.neonate)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.neonate)} Character Trackers`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.ancilla)} ${Supporter.getName(Supporter.ancilla)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.ancilla)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.ancilla)} Character Trackers`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.elder)} ${Supporter.getName(Supporter.elder)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.elder)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.elder)} Character Trackers`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.methuselah)} ${Supporter.getName(Supporter.methuselah)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.methuselah)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.methuselah)} Character Trackers`,
      inline: false,
    },
    {
      name: `${Supporter.getEmoji(Supporter.antediluvian)} ${Supporter.getName(Supporter.antediluvian)}`,
      value: `• ${Supporter.getSheetLimit(Supporter.antediluvian)} Character Sheets\n• ${Supporter.getTrackerLimit(Supporter.antediluvian)} Character Trackers`,
      inline: false,
    }
  );

  embed.addFields({
    name: "🚀 Get Started",
    value:
      "Visit our [Patreon page](https://www.patreon.com/MiraiMiki) to choose your tier and start supporting the project!",
    inline: false,
  });

  embed.setFooter({
    text: "Your support helps keep this project alive and growing!",
    iconURL: interaction.client.user.displayAvatarURL(),
  });

  return {
    flags: MessageFlags.Ephemeral,
    embeds: [embed],
  };
}

module.exports = {
  supporterStatus,
  supporterJoin,
};

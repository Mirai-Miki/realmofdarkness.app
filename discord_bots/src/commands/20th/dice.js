"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const roll20th = require("@modules/dice/roll20th");
const roll20thInit = require("@modules/dice/roll20thInit");
const generalRoll = require("@src/modules/dice/generalRoll");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete20th = require("@modules/autocomplete");
const { Splats } = require("@constants");

module.exports = {
  data: getCommands(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    switch (interaction.options.getSubcommand()) {
      case "roll":
        return await roll20th(interaction);
      case "initiative":
        return await roll20thInit(interaction);
      case "general":
        return generalRoll(interaction);
    }
  },

  async autocomplete(interaction) {
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

function getCommands() {
  let slashcommand = new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Dice rolls for 20th Anniversary Edition games.")

    //////////////// Dice Roll Command ////////////////
    .addSubcommand((subcommand) =>
      subcommand
        .setName("roll")
        .setDescription("Standard dice roll.")

        .addIntegerOption((option) =>
          option
            .setName("pool")
            .setDescription("Number of dice to roll (1-50).")
            .setMaxValue(50)
            .setMinValue(1)
            .setRequired(true)
        )

        .addIntegerOption((option) =>
          option
            .setName("difficulty")
            .setDescription("Difficulty (2-10).")
            .setMaxValue(10)
            .setMinValue(2)
            .setRequired(true)
        )

        .addBooleanOption((option) =>
          option
            .setName("willpower")
            .setDescription("Add 1 automatic success (Willpower).")
        )

        .addIntegerOption((option) =>
          option
            .setName("modifier")
            .setDescription("Number of automatic successes.")
            .setMaxValue(20)
            .setMinValue(-20)
        )

        .addStringOption((option) =>
          option
            .setName("speciality")
            .setDescription("Specialty applied to the roll.")
            .setMaxLength(100)
        )

        .addIntegerOption((option) =>
          option
            .setName("nightmare")
            .setDescription("Replace X dice with Nightmare dice (1-50).")
            .setMaxValue(50)
            .setMinValue(1)
        )

        .addStringOption((option) =>
          option
            .setName("character")
            .setDescription("Character name for this roll.")
            .setMaxLength(50)
            .setAutocomplete(true)
        )

        .addBooleanOption((option) =>
          option
            .setName("no_botch")
            .setDescription("1s do not remove successes from the result.")
        )

        .addStringOption((option) =>
          option
            .setName("notes")
            .setDescription("Additional notes or info.")
            .setMaxLength(300)
        )
    )

    //////////////////// Dice Initiative Command ////////////////////
    .addSubcommand((subcommand) =>
      subcommand
        .setName("initiative")
        .setDescription("Initiative roll (Dexterity + Wits).")

        .addIntegerOption((option) =>
          option
            .setName("dexterity_wits")
            .setDescription("Dexterity + Wits (0-50).")
            .setMaxValue(50)
            .setMinValue(0)
            .setRequired(true)
        )

        .addStringOption((option) =>
          option
            .setName("character")
            .setDescription("Character name for this roll.")
            .setMaxLength(50)
            .setAutocomplete(true)
        )

        .addStringOption((option) =>
          option
            .setName("notes")
            .setDescription("Additional notes or info.")
            .setMaxLength(300)
        )
    )

    ////////////////// Dice General Command ////////////////////////////
    .addSubcommand((subcommand) =>
      subcommand
        .setName("general")
        .setDescription("Roll X-sided dice (e.g. 2d6, 1d20, etc.)")

        .addStringOption((option) =>
          option
            .setName("dice_set_01")
            .setDescription("Dice set in format (x)d(y), e.g. 2d6. Required.")
            .setMaxLength(9)
            .setRequired(true)
        )

        .addIntegerOption((option) =>
          option
            .setName("modifier")
            .setDescription("Add or subtract from the total result.")
            .setMaxValue(1000)
            .setMinValue(-1000)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_02")
            .setDescription("Additional dice set in format (x)d(y), e.g. 1d8.")
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_03")
            .setDescription("Additional dice set in format (x)d(y), e.g. 1d8.")
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_04")
            .setDescription("Additional dice set in format (x)d(y), e.g. 1d8.")
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_05")
            .setDescription("Additional dice set in format (x)d(y), e.g. 1d8.")
            .setMaxLength(9)
        )

        .addIntegerOption((option) =>
          option
            .setName("difficulty")
            .setDescription("Total needed to pass the roll.")
            .setMaxValue(1000)
            .setMinValue(1)
        )

        .addStringOption((option) =>
          option
            .setName("notes")
            .setDescription("Additional notes or info.")
            .setMaxLength(300)
        )
    );
  return slashcommand;
}

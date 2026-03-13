"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const hunterDice = require("@src/modules/dice/5th/hunterRoll");
const generalRoll = require("@src/modules/dice/generalRoll");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const autocomplete5th = require("@modules/autocomplete");
const { Splats } = require("@constants");

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";
    switch (interaction.options.getSubcommand()) {
      case "roll":
        return await hunterDice(interaction);
      case "general":
        return generalRoll(interaction);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, [
      Splats.hunter5th.slug,
      Splats.human5th.slug,
    ]);
  },
};

function getCommand() {
  const command = new SlashCommandBuilder();

  command.setName("h").setDescription("Dice rolls for the Hunter 5th game.");

  ///////////////////// Hunter Command ///////////////////
  command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("roll")
        .setDescription("Standard Hunter 5th roll.")

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
            .setName("desperation")
            .setDescription("Desperation dice to add (0-5). Defaults to 0.")
            .setMaxValue(5)
            .setMinValue(0)
        )

        .addBooleanOption((option) => {
          option
            .setName("use_char_desperation")
            .setDescription(
              "Use desperation dice from your linked character (if available)."
            );
          return option;
        })

        .addIntegerOption((option) =>
          option
            .setName("difficulty")
            .setDescription(
              "Number of dice successes needed to pass (1-50). Defaults to 1."
            )
            .setMaxValue(50)
            .setMinValue(1)
        )

        .addStringOption((option) =>
          option
            .setName("speciality")
            .setDescription(
              "Speciality applied to the roll (adds 1 die to your pool)."
            )
            .setMaxLength(100)
        )

        .addStringOption((option) =>
          option
            .setName("character")
            .setDescription("Name of the character making the roll.")
            .setMaxLength(50)
            .setAutocomplete(true)
        )

        .addStringOption((option) =>
          option
            .setName("notes")
            .setDescription("Any additional information you want to include.")
            .setMaxLength(300)
        )
    )

    /////////////////// General Roll Command ///////////////////////
    .addSubcommand((subcommand) =>
      subcommand
        .setName("general")
        .setDescription("Roll X-sided dice.")

        .addStringOption((option) =>
          option
            .setName("dice_set_01")
            .setDescription('Dice set: "(x)d(y)", e.g. "2d6".')
            .setRequired(true)
            .setMaxLength(9)
        )

        .addIntegerOption((option) =>
          option
            .setName("modifier")
            .setDescription("Add or remove from the total result.")
            .setMaxValue(1000)
            .setMinValue(-1000)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_02")
            .setDescription('Dice set: "(x)d(y)", e.g. "2d6".')
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_03")
            .setDescription('Dice set: "(x)d(y)", e.g. "2d6".')
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_04")
            .setDescription('Dice set: "(x)d(y)", e.g. "2d6".')
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_05")
            .setDescription('Dice set: "(x)d(y)", e.g. "2d6".')
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
            .setDescription("Any additional information you want to include.")
            .setMaxLength(300)
        )
    );
  return command;
}

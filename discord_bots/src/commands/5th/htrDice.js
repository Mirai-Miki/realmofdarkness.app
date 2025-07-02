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

  command.setName("h").setDescription("Dice rolls for the hunter v5 game.");

  ///////////////////// Hunter Command ///////////////////
  command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("roll")
        .setDescription("Standard roll")

        .addIntegerOption((option) =>
          option
            .setName("pool")
            .setDescription(
              "The Number of dice to roll. Must be between 1 and 50"
            )
            .setMaxValue(50)
            .setMinValue(1)
            .setRequired(true)
        )

        .addIntegerOption((option) =>
          option
            .setName("desperation")
            .setDescription(
              "The number of desperation dice to add to the pool. Must be between 0 to 5. Defaults to 0."
            )
            .setMaxValue(5)
            .setMinValue(0)
        )

        .addBooleanOption((option) => {
          option
            .setName("use_char_desperation")
            .setDescription(
              "Add the Desperation dice value from your linked character (if available)."
            );
          return option;
        })

        .addIntegerOption((option) =>
          option
            .setName("difficulty")
            .setDescription(
              "The Difficulty is the number of dice 6+ needed. Must be between 1 and 50. Defaults to 1."
            )
            .setMaxValue(50)
            .setMinValue(1)
        )

        .addStringOption((option) =>
          option
            .setName("speciality")
            .setDescription(
              "The speciality applied to the roll. This adds one dice to your pool."
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
            .setDescription("Any extra information you would like to include.")
            .setMaxLength(300)
        )
    )

    /////////////////// General Roll Command ///////////////////////
    .addSubcommand((subcommand) =>
      subcommand
        .setName("general")
        .setDescription("Roll a number of X-sided dice.")

        .addStringOption((option) =>
          option
            .setName("dice_set_01")
            .setDescription(
              'A dice set is defined as "(x)d(y)" where (x) is the number of dice and (y) is the number of sides.'
            )
            .setRequired(true)
            .setMaxLength(9)
        )

        .addIntegerOption((option) =>
          option
            .setName("modifier")
            .setDescription("Adds or removes the number from the total.")
            .setMaxValue(1000)
            .setMinValue(-1000)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_02")
            .setDescription(
              'A dice set is defined as "(x)d(y)" where (x) is the number of dice and (y) is the number of sides.'
            )
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_03")
            .setDescription(
              'A dice set is defined as "(x)d(y)" where (x) is the number of dice and (y) is the number of sides.'
            )
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_04")
            .setDescription(
              'A dice set is defined as "(x)d(y)" where (x) is the number of dice and (y) is the number of sides.'
            )
            .setMaxLength(9)
        )

        .addStringOption((option) =>
          option
            .setName("dice_set_05")
            .setDescription(
              'A dice set is defined as "(x)d(y)" where (x) is the number of dice and (y) is the number of sides.'
            )
            .setMaxLength(9)
        )

        .addIntegerOption((option) =>
          option
            .setName("difficulty")
            .setDescription("The total needed to pass the Roll.")
            .setMaxValue(1000)
            .setMinValue(1)
        )

        .addStringOption((option) =>
          option
            .setName("notes")
            .setDescription(
              "Any additional information you would like to include."
            )
            .setMaxLength(300)
        )
    );
  return command;
}

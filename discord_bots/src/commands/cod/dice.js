"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const codRoll = require("@modules/dice/codRoll");
const generalRoll = require("@src/modules/dice/generalRoll");
const commandUpdate = require("@modules/commandDatabaseUpdate");

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    switch (interaction.options.getSubcommand()) {
      case "roll":
        return await codRoll(interaction);
      case "general":
        return generalRoll(interaction);
    }
  },
};

function getCommand() {
  const command = new SlashCommandBuilder();

  command
    .setName("dice")
    .setDescription("Dice rolling commands for Chronicles of Darkness.");

  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription("Standard dice pool roll.")

      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("Number of dice to roll.")
          .setMaxValue(30)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("bonus")
          .setDescription("Bonus dice to add to the pool.")
          .setMaxValue(30)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("penalty")
          .setDescription("Penalty dice to subtract from the pool.")
          .setMaxValue(30)
          .setMinValue(1)
      )

      .addStringOption((option) =>
        option
          .setName("speciality")
          .setDescription("Specialty used (adds 1 die).")
          .setMaxLength(50)
      )

      .addBooleanOption((option) =>
        option.setName("willpower").setDescription("Add +3 dice to your pool.")
      )

      .addBooleanOption((option) =>
        option.setName("rote").setDescription("Reroll each failed die once.")
      )

      .addIntegerOption((option) =>
        option
          .setName("target")
          .setDescription("Target number to succeed (default 8).")
          .setMaxValue(10)
          .setMinValue(2)
      )

      .addIntegerOption((option) =>
        option
          .setName("reroll")
          .setDescription(
            "Lowest die value to reroll (default 10, 11 disables rerolls)."
          )
          .setMaxValue(11)
          .setMinValue(8)
      )

      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Character name for the roll.")
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Extra info or notes to include.")
          .setMaxLength(300)
      )
  );

  /////////////////// General Roll Command ///////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("general")
      .setDescription("Roll any number of X-sided dice.")

      .addStringOption((option) =>
        option
          .setName("dice_set_01")
          .setDescription('Dice set in the form "XdY" (e.g. 2d6).')
          .setRequired(true)
          .setMaxLength(9)
      )

      .addIntegerOption((option) =>
        option
          .setName("modifier")
          .setDescription("Add or subtract from the total.")
          .setMaxValue(1000)
          .setMinValue(-1000)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_02")
          .setDescription('Dice set in the form "XdY" (e.g. 2d6).')
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_03")
          .setDescription('Dice set in the form "XdY" (e.g. 2d6).')
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_04")
          .setDescription('Dice set in the form "XdY" (e.g. 2d6).')
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_05")
          .setDescription('Dice set in the form "XdY" (e.g. 2d6).')
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
          .setDescription("Extra info or notes to include.")
          .setMaxLength(300)
      )
  );
  return command;
}

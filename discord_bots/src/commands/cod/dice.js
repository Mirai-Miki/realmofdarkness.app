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

  command.setName("dice").setDescription("Dice rolls for the CoD Game.");

  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription("Standard roll. p69 CoD")

      .addIntegerOption((option) =>
        option
          .setName("pool")
          .setDescription("The Number of dice to roll.")
          .setMaxValue(30)
          .setMinValue(1)
          .setRequired(true)
      )

      .addIntegerOption((option) =>
        option
          .setName("bonus")
          .setDescription("Adds bonus dice from the total pool.")
          .setMaxValue(30)
          .setMinValue(1)
      )

      .addIntegerOption((option) =>
        option
          .setName("penalty")
          .setDescription("Removes dice from the total pool.")
          .setMaxValue(30)
          .setMinValue(1)
      )

      .addStringOption((option) =>
        option
          .setName("speciality")
          .setDescription(
            "Name of the specialty used in the roll." +
              " Adds one die to the pool"
          )
          .setMaxLength(50)
      )

      .addBooleanOption((option) =>
        option
          .setName("willpower")
          .setDescription("Adds +3 dice to your pool. p73 CoD")
      )

      .addBooleanOption((option) =>
        option
          .setName("rote")
          .setDescription("Rerolls each failed dice once. p72 CoD")
      )

      .addIntegerOption((option) =>
        option
          .setName("target")
          .setDescription(
            "The target number needed for a dice " +
              " to succed. Defaults to 8."
          )
          .setMaxValue(10)
          .setMinValue(2)
      )

      .addIntegerOption((option) =>
        option
          .setName("reroll")
          .setDescription(
            "Lowest dice number in which a reroll will" +
              " occur. Setting to 11 will disable rerolls. Defaults to 10."
          )
          .setMaxValue(11)
          .setMinValue(8)
      )

      .addStringOption((option) =>
        option
          .setName("character")
          .setDescription("Name of the character making the roll.")
          .setMaxLength(50)
      )

      .addStringOption((option) =>
        option
          .setName("notes")
          .setDescription("Any extra information you would like to include.")
          .setMaxLength(300)
      )
  );

  /////////////////// General Roll Command ///////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("general")
      .setDescription("Roll a number of X-sided dice.")

      .addStringOption((option) =>
        option
          .setName("dice_set_01")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
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
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_03")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_04")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9)
      )

      .addStringOption((option) =>
        option
          .setName("dice_set_05")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
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

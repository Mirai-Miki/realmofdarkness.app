"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { oneLineTrim } = require("common-tags");
const generalRoll = require("@src/modules/dice/generalRoll");
const wtaRoll = require("@modules/dice/5th/wtaRoll");
const rageRoll = require("@modules/dice/5th/rageRoll");
const riteRoll = require("@modules/dice/5th/riteRoll");
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
        return await wtaRoll(interaction);
      case "rage":
        return await rageRoll(interaction);
      case "rite":
        return await riteRoll(interaction);
      case "general":
        return generalRoll(interaction);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, [
      Splats.werewolf5th.slug,
      Splats.human5th.slug,
    ]);
  },
};

function getCommand() {
  const command = new SlashCommandBuilder()
    .setName("w")
    .setDescription("Dice rolls for the wta 5th Game.");

  ///////////////////////// WtA Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription(
        oneLineTrim`
      Makes a dice roll following the standard Warewolf: 
      the Apocalypse 5th rules. page 133 Corebook
    `
      )

      .addIntegerOption((option) => {
        option
          .setName("pool")
          .setDescription(
            oneLineTrim`
        The base pool you will be rolling whith, can be modified by other 
        arguments.
      `
          )
          .setMaxValue(50)
          .setMinValue(1)
          .setRequired(true);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("rage")
          .setDescription(
            "The number of rage dice included in " +
              "the pool. Must be between 0 to 5. Defaults to 0. p133"
          )
          .setMaxValue(5)
          .setMinValue(0);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription(
            "The Difficulty is the number of dice " +
              " 6+ needed. Must be between 1 and 50." +
              " Defaults to 1."
          )
          .setMaxValue(50)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription(
            "The speciality applied to the roll. " +
              " This adds one dice to your pool."
          )
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rage_check")
          .setDescription("Select if you would also like do a rage check. p132")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("double_rage_check")
          .setDescription(
            "Select if you would also like do 2 rage checks. p132"
          )
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Name of the character making the roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("auto_rage")
          .setDescription(
            "Select if you would like to disable auto rage dice."
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription(
            "Any extra information you would like to include about this roll."
          )
          .setMaxLength(300);
        return option;
      })
  );

  ///////////////////// Rage Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("rage")
      .setDescription("Perform a Rage Check")

      .addIntegerOption((option) => {
        option
          .setName("checks")
          .setDescription("The number of Rage checks you would like to make.")
          .setMinValue(1)
          .setMaxValue(5);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("reroll")
          .setDescription("Select if you are able to roll 2 dice.");
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Name of the character making the roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription(
            "Any extra information you would like to include about this roll."
          )
          .setMaxLength(300);
        return option;
      })
  );

  ///////////////////////// Rite Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("rite")
      .setDescription(
        oneLineTrim`
      Makes a dice roll following the rite roll of Warewolf: 
      the Apocalypse 5th rules. page 180 Corebook
    `
      )

      .addIntegerOption((option) => {
        option
          .setName("pool")
          .setDescription(
            oneLineTrim`
        The base pool you will be rolling whith, can be modified by other 
        arguments.
      `
          )
          .setMaxValue(50)
          .setMinValue(1)
          .setRequired(true);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("rage")
          .setDescription(
            "The number of rage dice included in " +
              "the pool. Must be between 0 to 5. Defaults to 0. p133"
          )
          .setMaxValue(5)
          .setMinValue(0);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("trained_participants")
          .setDescription(
            "The number of trained participants joining the Rite " +
              " Must be between 1 and 20."
          )
          .setMaxValue(20)
          .setMinValue(1);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("participants")
          .setDescription(
            "The number of Non-trained participants joining the Rite" +
              " Must be between 1 and 20."
          )
          .setMaxValue(20)
          .setMinValue(1);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription(
            "The Difficulty is the number of dice " +
              " 6+ needed. Must be between 1 and 50." +
              " Defaults to 1."
          )
          .setMaxValue(50)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription(
            "The speciality applied to the roll. " +
              " This adds one dice to your pool."
          )
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rage_check")
          .setDescription("Select if you would also like do a rage check. p132")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Name of the character making the roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription(
            "Any extra information you would like to include about this roll."
          )
          .setMaxLength(300);
        return option;
      })
  );

  /////////////////// General Roll Command ///////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("general")
      .setDescription("Roll a number of X-sided dice.")

      .addStringOption((option) => {
        option
          .setName("dice_set_01")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setRequired(true)
          .setMaxLength(9);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("modifier")
          .setDescription("Adds or removes the number from the total.")
          .setMaxValue(1000)
          .setMinValue(-1000);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_02")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_03")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_04")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_05")
          .setDescription(
            'A dice set is defined as "(x)d(y)"' +
              " where (x) is the number of dice and (y) is the number of sides."
          )
          .setMaxLength(9);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription("The total needed to pass the Roll.")
          .setMaxValue(1000)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription(
            "Any extra information you would like to include about this roll."
          )
          .setMaxLength(300);
        return option;
      })
  );
  return command;
}

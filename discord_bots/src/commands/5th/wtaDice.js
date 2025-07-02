"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
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
    .setDescription("Dice rolls for the WtA 5th game.");

  ///////////////////////// WtA Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription("Roll dice using Werewolf: the Apocalypse 5th rules.")

      .addIntegerOption((option) => {
        option
          .setName("pool")
          .setDescription(
            "Base dice pool to roll. Can be modified by other options."
          )
          .setMaxValue(50)
          .setMinValue(1)
          .setRequired(true);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("rage")
          .setDescription("Number of rage dice (0-5). Defaults to 0.")
          .setMaxValue(5)
          .setMinValue(0);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("use_char_rage")
          .setDescription(
            "Use rage dice from your linked character (Defaults to true)."
          );
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription(
            "Number of successes needed to succeed (1-50). Defaults to 1."
          )
          .setMaxValue(50)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription("Specialty applied to the roll (Adds 1 die).")
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rage_check")
          .setDescription("Adds a rage check to the roll.")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("double_rage_check")
          .setDescription("Adds a double rage check to the roll.")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Character name for this roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription("Extra info to include about this roll.")
          .setMaxLength(300);
        return option;
      })
  );

  ///////////////////// Rage Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("rage")
      .setDescription("Perform a Rage Check.")

      .addIntegerOption((option) => {
        option
          .setName("checks")
          .setDescription("Number of Rage checks to make (1-5).")
          .setMinValue(1)
          .setMaxValue(5);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("reroll")
          .setDescription("Uses 2 dice for the Rage checks.");
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Character name for this roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription("Extra info to include about this roll.")
          .setMaxLength(300);
        return option;
      })
  );

  ///////////////////////// Rite Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("rite")
      .setDescription(
        "Roll dice for a Rite using Werewolf: the Apocalypse 5th rules."
      )

      .addIntegerOption((option) => {
        option
          .setName("pool")
          .setDescription(
            "Base dice pool to roll. Can be modified by other options."
          )
          .setMaxValue(50)
          .setMinValue(1)
          .setRequired(true);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("rage")
          .setDescription("Number of rage dice (0-5). Defaults to 0.")
          .setMaxValue(5)
          .setMinValue(0);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("trained_participants")
          .setDescription("Number of trained participants in the rite (1-20).")
          .setMaxValue(20)
          .setMinValue(1);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("participants")
          .setDescription("Number of non-trained participants (1-20).")
          .setMaxValue(20)
          .setMinValue(1);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription(
            "Number of successes needed to succeed (1-50). Defaults to 1."
          )
          .setMaxValue(50)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription("Specialty applied to the roll (Adds 1 die).")
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rage_check")
          .setDescription("Choose if you want to do a rage check.")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription("Character name for this roll.")
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription("Extra info to include about this roll.")
          .setMaxLength(300);
        return option;
      })
  );

  /////////////////// General Roll Command ///////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("general")
      .setDescription("Roll X-sided dice.")

      .addStringOption((option) => {
        option
          .setName("dice_set_01")
          .setDescription(
            'Format: "(x)d(y)" where x = dice, y = sides. E.g. "2d6".'
          )
          .setRequired(true)
          .setMaxLength(9);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("modifier")
          .setDescription("Add or subtract from the total.")
          .setMaxValue(1000)
          .setMinValue(-1000);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_02")
          .setDescription(
            'Format: "(x)d(y)" where x = dice, y = sides. E.g. "2d6".'
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_03")
          .setDescription(
            'Format: "(x)d(y)" where x = dice, y = sides. E.g. "2d6".'
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_04")
          .setDescription(
            'Format: "(x)d(y)" where x = dice, y = sides. E.g. "2d6".'
          )
          .setMaxLength(9);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("dice_set_05")
          .setDescription(
            'Format: "(x)d(y)" where x = dice, y = sides. E.g. "2d6".'
          )
          .setMaxLength(9);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription("Total needed to pass the roll.")
          .setMaxValue(1000)
          .setMinValue(1);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription("Extra info to include about this roll.")
          .setMaxLength(300);
        return option;
      })
  );
  return command;
}

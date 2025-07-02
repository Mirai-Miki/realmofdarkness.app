"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { v5Roll } = require("@modules/dice/5th/vtmRoll");
const rouse = require("@src/modules/dice/5th/rouse");
const resonance = require("@src/modules/dice/5th/resonance");
const generalRoll = require("@src/modules/dice/generalRoll");
const { healSuperficial } = require("@modules/dice/5th/vtmHealRoll");
const compulsionRoll = require("@modules/dice/5th/compulsionRoll");
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
        return await v5Roll(interaction);
      case "resonance":
        return resonance(interaction);
      case "rouse":
        return await rouse(interaction);
      case "compulsion":
        return await compulsionRoll(interaction);
      case "healsuperficial":
        return await healSuperficial(interaction);
      case "general":
        return generalRoll(interaction);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, [
      Splats.vampire5th.slug,
      Splats.human5th.slug,
      Splats.ghoul5th.slug,
    ]);
  },
};

function getCommand() {
  const command = new SlashCommandBuilder()
    .setName("v")
    .setDescription("Dice rolls for the VTM V5 game.");

  ///////////////////////// VtM Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription("Roll dice using Vampire: the Masquerade V5 rules.")

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
          .setName("hunger")
          .setDescription("Number of hunger dice (0-5). Defaults to 0.")
          .setMaxValue(5)
          .setMinValue(0);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("use_char_hunger")
          .setDescription(
            "Use hunger dice from your linked character (Defaults to true)."
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

      .addIntegerOption((option) => {
        option
          .setName("blood_surge")
          .setDescription(
            "Current Blood Potency (0-10). Rouses the Blood and adds BP dice."
          )
          .setMaxValue(10)
          .setMinValue(0);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription("Specialty applied to the roll. Adds 1 die.")
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rouse")
          .setDescription("Choose if you want to Rouse the blood.")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("character")
          .setDescription(
            "Character name for this roll. Links a character (if available)."
          )
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

  ///////////////////// Rouse Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("rouse")
      .setDescription("Rouse the blood for special feats.")

      .addBooleanOption((option) => {
        option.setName("reroll").setDescription("Can you roll 2 dice?");
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

  /////////////////// Resonance Command ///////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("resonance")
      .setDescription("Temperament and Resonance roll.")

      .addStringOption((option) => {
        option
          .setName("resonance")
          .setDescription("Choose the resonance if known.")
          .addChoices(
            { name: "Phlegmatic", value: "Phlegmatic" },
            { name: "Melancholy", value: "Melancholy" },
            { name: "Choleric", value: "Choleric" },
            { name: "Sanguine", value: "Sanguine" },
            { name: "Empty", value: "Empty" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("temperament")
          .setDescription("Choose the temperament if known.")
          .addChoices(
            { name: "Fleeting", value: "Fleeting" },
            { name: "Intense", value: "Intense" },
            { name: "Acute", value: "Acute" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("min_temperament")
          .setDescription(
            "Temperaments below this are not included in the roll."
          )
          .addChoices(
            { name: "Fleeting", value: "Fleeting" },
            { name: "Intense", value: "Intense" }
          );
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

  /////////////////// Compulsion Command ///////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("compulsion")
      .setDescription("Random Compulsion roll.")

      .addStringOption((option) => {
        option
          .setName("clan")
          .setDescription("Show Clan Compulsion info.")
          .addChoices(
            { name: "Banu Haqim", value: "BANU_HAQIM" },
            { name: "Brujah", value: "BRUJAH" },
            { name: "Gangrel", value: "GANGREL" },
            { name: "Hecata", value: "HECATA" },
            { name: "Lasombra", value: "LASOMBRA" },
            { name: "Malkavian", value: "MALKAVIAN" },
            { name: "Ministry", value: "MINISTRY" },
            { name: "Nosferatu", value: "NOSFERATU" },
            { name: "Ravnos", value: "RAVNOS" },
            { name: "Salubri", value: "SALUBRI" },
            { name: "Toreador", value: "TOREADOR" },
            { name: "Tremere", value: "TREMERE" },
            { name: "Tzimisce", value: "TZIMISCE" },
            { name: "Ventrue", value: "VENTRUE" }
          );
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("no_clan")
          .setDescription("Cannot get a Clan Compulsion.");
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

  /////////////////// Heal Superficial ///////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("healsuperficial")
      .setDescription("Heal Superficial Damage.")

      .addStringOption((option) => {
        option
          .setName("type")
          .setDescription("Type of damage to heal.")
          .setRequired(true)
          .addChoices(
            { name: "Health", value: "health" },
            { name: "Willpower [Sheet Required]", value: "willpower" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("name")
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

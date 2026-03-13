"use strict";
require(`${process.cwd()}/alias`);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { oneLineTrim } = require("common-tags");
const { v5SheetRoll } = require("@modules/dice/5th/vtmRoll");
const commandUpdate = require("@modules/commandDatabaseUpdate");
const { Splats } = require("@constants");
const autocomplete5th = require("@modules/autocomplete");

module.exports = {
  data: getCommand(),
  async execute(interaction) {
    await interaction.deferReply();
    await commandUpdate(interaction);

    if (!interaction.isRepliable()) return "notRepliable";

    switch (interaction.options.getSubcommand()) {
      case "roll":
        return await v5SheetRoll(interaction);
    }
  },

  async autocomplete(interaction) {
    return await autocomplete5th(interaction, Splats.vampire5th.slug, true);
  },
};

function getCommand() {
  const command = new SlashCommandBuilder()
    .setName("sheet")
    .setDescription("Dice rolls for the Vampire: the Masquerade V5 game.");

  ///////////////////////// V5 Sheet Roll Command //////////////////////
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription(
        "Rolls dice using standard Vampire: the Masquerade V5 rules."
      )

      .addStringOption((option) => {
        option
          .setName("attribute")
          .setDescription("Select the first attribute for your pool.")
          .setChoices(
            { name: "Strength", value: "strength" },
            { name: "Dexterity", value: "dexterity" },
            { name: "Stamina", value: "stamina" },
            { name: "Charisma", value: "charisma" },
            { name: "Manipulation", value: "manipulation" },
            { name: "Composure", value: "composure" },
            { name: "Intelligence", value: "intelligence" },
            { name: "Wits", value: "wits" },
            { name: "Resolve", value: "resolve" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("attribute2")
          .setDescription("Select the second attribute for your pool.")
          .setChoices(
            { name: "Strength", value: "strength" },
            { name: "Dexterity", value: "dexterity" },
            { name: "Stamina", value: "stamina" },
            { name: "Charisma", value: "charisma" },
            { name: "Manipulation", value: "manipulation" },
            { name: "Composure", value: "composure" },
            { name: "Intelligence", value: "intelligence" },
            { name: "Wits", value: "wits" },
            { name: "Resolve", value: "resolve" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("skill_physical")
          .setDescription("Select the physical skill for your pool.")
          .setChoices(
            { name: "Athletics", value: "athletics" },
            { name: "Brawl", value: "brawl" },
            { name: "Craft", value: "craft" },
            { name: "Drive", value: "drive" },
            { name: "Firearms", value: "firearms" },
            { name: "Larceny", value: "larceny" },
            { name: "Melee", value: "melee" },
            { name: "Stealth", value: "stealth" },
            { name: "Survival", value: "survival" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("skill_social")
          .setDescription("Select the social skill for your pool.")
          .setChoices(
            { name: "animal_ken", value: "animal_ken" },
            { name: "etiquette", value: "etiquette" },
            { name: "insight", value: "insight" },
            { name: "intimidation", value: "intimidation" },
            { name: "leadership", value: "leadership" },
            { name: "performance", value: "performance" },
            { name: "persuasion", value: "persuasion" },
            { name: "streetwise", value: "streetwise" },
            { name: "subterfuge", value: "subterfuge" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("skill_mental")
          .setDescription("Select the mental skill for your pool.")
          .setChoices(
            { name: "academics", value: "academics" },
            { name: "awareness", value: "awareness" },
            { name: "finance", value: "finance" },
            { name: "investigation", value: "investigation" },
            { name: "medicine", value: "medicine" },
            { name: "occult", value: "occult" },
            { name: "politics", value: "politics" },
            { name: "science", value: "science" },
            { name: "technology", value: "technology" }
          );
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("discipline")
          .setDescription("Select the discipline for your pool.")
          .setAutocomplete(true);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("modifier")
          .setDescription("Add or remove dice from your pool.")
          .setMaxValue(50)
          .setMinValue(-50);
        return option;
      })

      .addIntegerOption((option) => {
        option
          .setName("difficulty")
          .setDescription(
            "Number of dice successes needed (1-50). Defaults to 1."
          )
          .setMaxValue(50)
          .setMinValue(1);
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("blood_surge")
          .setDescription("Add surge dice (also Rouses the blood).");
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("speciality")
          .setDescription("Speciality applied to the roll (adds 1 die).")
          .setMaxLength(100);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("rouse")
          .setDescription("Rouse the blood.")
          .setChoices(
            { name: "No Reroll", value: "No Reroll" },
            { name: "Reroll", value: "Reroll" }
          );
        return option;
      })

      .addBooleanOption((option) => {
        option
          .setName("hunger")
          .setDescription("Add your hunger to the roll (Default is True).");
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("name")
          .setDescription(
            "Name of the character making the roll (must be a sheet character)."
          )
          .setMaxLength(50)
          .setAutocomplete(true);
        return option;
      })

      .addStringOption((option) => {
        option
          .setName("notes")
          .setDescription(
            "Any additional information you want to include about this roll."
          )
          .setMaxLength(300);
        return option;
      })
  );
  return command;
}

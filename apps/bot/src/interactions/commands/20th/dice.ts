/**
 * 20th Anniversary Edition dice rolling command.
 * Builds slash command using validation constants from @realm/common.
 */
import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js";

import { SlashCommandBuilder } from "discord.js";
import {
  UserError,
  Wod20DiceConstraints,
  GeneralDiceConstraints,
  CharacterConstraints,
  CommandNotesMaxLength,
} from "@realm/common";

module.exports = {
  data: getCommand(),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "roll":
        throw new Error("Not implemented");

      case "initiative":
        throw new Error("Not implemented");

      case "general":
        throw new Error("Not implemented");

      default:
        throw new UserError(`Unknown subcommand: ${subcommand}`);
    }
  },

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    throw new Error("Not implemented");
  },
};

function getCommand() {
  return (
    new SlashCommandBuilder()
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
              .setDescription(
                `Number of dice to roll (${Wod20DiceConstraints.PoolMin}-${Wod20DiceConstraints.PoolMax}).`
              )
              .setMaxValue(Wod20DiceConstraints.PoolMax)
              .setMinValue(Wod20DiceConstraints.PoolMin)
              .setRequired(true)
          )

          .addIntegerOption((option) =>
            option
              .setName("difficulty")
              .setDescription(
                `Difficulty (${Wod20DiceConstraints.DifficultyMin}-${Wod20DiceConstraints.DifficultyMax}).`
              )
              .setMaxValue(Wod20DiceConstraints.DifficultyMax)
              .setMinValue(Wod20DiceConstraints.DifficultyMin)
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
              .setMaxValue(Wod20DiceConstraints.ModifierMax)
              .setMinValue(Wod20DiceConstraints.ModifierMin)
          )

          .addStringOption((option) =>
            option
              .setName("speciality")
              .setDescription("Specialty applied to the roll.")
              .setMaxLength(Wod20DiceConstraints.SpecialtyMaxLength)
          )

          .addIntegerOption((option) =>
            option
              .setName("nightmare")
              .setDescription(
                `Replace X dice with Nightmare dice (1-${Wod20DiceConstraints.NightmareDiceMax}).`
              )
              .setMaxValue(Wod20DiceConstraints.NightmareDiceMax)
              .setMinValue(1)
          )

          .addStringOption((option) =>
            option
              .setName("character")
              .setDescription("Character name for this roll.")
              .setMaxLength(CharacterConstraints.Name.MaxLength)
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
              .setMaxLength(CommandNotesMaxLength)
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
              .setDescription(
                `Dexterity + Wits (0-${Wod20DiceConstraints.PoolMax}).`
              )
              .setMaxValue(Wod20DiceConstraints.PoolMax)
              .setMinValue(0)
              .setRequired(true)
          )

          .addStringOption((option) =>
            option
              .setName("character")
              .setDescription("Character name for this roll.")
              .setMaxLength(CharacterConstraints.Name.MaxLength)
              .setAutocomplete(true)
          )

          .addStringOption((option) =>
            option
              .setName("notes")
              .setDescription("Additional notes or info.")
              .setMaxLength(CommandNotesMaxLength)
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
              .setMaxLength(GeneralDiceConstraints.DiceSetFormatMaxLength)
              .setRequired(true)
          )

          .addIntegerOption((option) =>
            option
              .setName("modifier")
              .setDescription("Add or subtract from the total result.")
              .setMaxValue(GeneralDiceConstraints.ModifierMax)
              .setMinValue(GeneralDiceConstraints.ModifierMin)
          )

          .addStringOption((option) =>
            option
              .setName("dice_set_02")
              .setDescription(
                "Additional dice set in format (x)d(y), e.g. 1d8."
              )
              .setMaxLength(GeneralDiceConstraints.DiceSetFormatMaxLength)
          )

          .addStringOption((option) =>
            option
              .setName("dice_set_03")
              .setDescription(
                "Additional dice set in format (x)d(y), e.g. 1d8."
              )
              .setMaxLength(GeneralDiceConstraints.DiceSetFormatMaxLength)
          )

          .addStringOption((option) =>
            option
              .setName("dice_set_04")
              .setDescription(
                "Additional dice set in format (x)d(y), e.g. 1d8."
              )
              .setMaxLength(GeneralDiceConstraints.DiceSetFormatMaxLength)
          )

          .addStringOption((option) =>
            option
              .setName("dice_set_05")
              .setDescription(
                "Additional dice set in format (x)d(y), e.g. 1d8."
              )
              .setMaxLength(GeneralDiceConstraints.DiceSetFormatMaxLength)
          )

          .addIntegerOption((option) =>
            option
              .setName("difficulty")
              .setDescription("Total needed to pass the roll.")
              .setMaxValue(GeneralDiceConstraints.DifficultyMax)
              .setMinValue(GeneralDiceConstraints.DifficultyMin)
          )

          .addStringOption((option) =>
            option
              .setName("notes")
              .setDescription("Additional notes or info.")
              .setMaxLength(CommandNotesMaxLength)
          )
      )
  );
}

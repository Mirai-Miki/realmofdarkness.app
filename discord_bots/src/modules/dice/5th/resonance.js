"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder } = require("discord.js");

module.exports = function resonance(interaction) {
  interaction.args = getArgs(interaction);
  interaction.rollResults = getResults(interaction);
  return { embeds: [getEmbed(interaction)] };
};

function getArgs(interaction) {
  return {
    temperament: interaction.options.getString("temperament"),
    resonance: interaction.options.getString("resonance"),
    minTemp: interaction.options.getString("min_temperament"),
    notes: interaction.options.getString("notes"),
  };
}

function getResults(interaction) {
  const args = interaction.args;
  const tdice = rollTemperament(args);
  const rdice = args.resonance ? null : Roll.single(10);
  return {
    temperamentDice: tdice,
    temperament: getTemperament(args, tdice),
    resonanceDice: rdice,
    resonance: getResonance(args, rdice),
  };
}

function rollTemperament(args) {
  if (args.temperament) return null;

  const dice = [];
  if (args.minTemp === "Fleeting") {
    const tempRoll = Roll.single(10);
    dice.push(tempRoll < 6 ? 6 : tempRoll);
  } else if (args.minTemp === "Intense") dice.push(10);
  else dice.push(Roll.single(10));

  if (dice[0] >= 9) dice.push(Roll.single(10));
  return dice;
}

function getTemperament(args, dice) {
  if (args.temperament) return TemperamentType[args.temperament];

  if (dice.length > 1 && dice[1] >= 9) return TemperamentType.Acute;
  else if (dice.length > 1) return TemperamentType.Intense;

  if (dice[0] < 6) return TemperamentType.Negligible;
  else return TemperamentType.Fleeting;
}

function getResonance(args, dice) {
  if (args.resonance) return ResonanceInfo[args.resonance];

  if (dice <= 3) return ResonanceInfo.Phlegmatic;
  else if (dice <= 6) return ResonanceInfo.Melancholy;
  else if (dice <= 8) return ResonanceInfo.Choleric;
  else return ResonanceInfo.Sanguine;
}

function getEmbed(interaction) {
  const results = interaction.rollResults;
  const args = interaction.args;
  const embed = new EmbedBuilder();

  embed.setAuthor({
    name:
      interaction.member?.displayName ??
      interaction.user.displayName ??
      interaction.user.username,
    iconURL:
      interaction.member?.displayAvatarURL() ??
      interaction.user.displayAvatarURL(),
  });

  embed.setTitle("Resonance Roll");
  embed.setColor(
    results.resonance.color[results.temperament.name] ?? "#000000"
  );
  embed.setURL("https://realmofdarkness.app/");

  if (args.minTemp)
    embed.addFields({
      name: "Minimum Temperament",
      value: `${args.minTemp}`,
    });

  embed.addFields({
    name: "Result",
    value:
      `\`\`\`${results.temperament.name}` +
      `${
        results.temperament.name === "Negligible"
          ? ""
          : " " + results.resonance.name
      }\`\`\``,
    inline: true,
  });

  embed.addFields({
    name: "Temperament",
    value: `\`\`\`${
      results.temperamentDice
        ? results.temperamentDice
        : results.temperament.name
    }\`\`\``,
    inline: true,
  });

  embed.addFields({
    name: "Resonance",
    value: `\`\`\`${
      results.resonanceDice ? results.resonanceDice : results.resonance.name
    }\`\`\``,
    inline: true,
  });

  if (results.temperament.value > 0) {
    embed.addFields({
      name: "Disciplines",
      value:
        results.temperament.value > 1
          ? results.resonance.powers + "\nAdd +1 dice"
          : results.resonance.powers,
      inline: true,
    });

    embed.addFields({
      name: "Emotions",
      value: results.resonance.description,
      inline: true,
    });
  }

  const links =
    "[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  if (args.notes) {
    embed.addFields({ name: "Notes", value: args.notes });
    embed.data.fields.at(-1).value += `\n${links}`;
  } else embed.addFields({ name: "⠀", value: links });

  return embed;
}

const TemperamentType = {
  Negligible: { name: "Negligible", value: 0 },
  Fleeting: { name: "Fleeting", value: 1 },
  Intense: { name: "Intense", value: 2 },
  Acute: { name: "Acute", value: 3 },
};

const ResonanceInfo = {
  Sanguine: {
    name: "Sanguine",
    description: "Horny, Happy, Addicted,\nActive, Flighty, Enthusiastic",
    powers: "Blood Sorcery, Presence",
    color: {
      Fleeting: "#96008f",
      Intense: "#c800c0",
      Acute: "#ff00f2",
    },
  },
  Choleric: {
    name: "Choleric",
    description: "Angry, Violent, Bullying,\nPassionate, Envious",
    powers: "Celerity, Potence",
    color: {
      Fleeting: "#960000",
      Intense: "#c80000",
      Acute: "#ff0000",
    },
  },
  Melancholy: {
    name: "Melancholy",
    description: "Sad, Scared, Intellectual,\nDepressed, Grounded",
    powers: "Fortitude, Obfuscate",
    color: {
      Fleeting: "#008596",
      Intense: "#00b1c8",
      Acute: "#00e1ff",
    },
  },
  Phlegmatic: {
    name: "Phlegmatic",
    description: "Lazy, Apathetic, Calm,\nControlling, Sentimental",
    powers: "Auspex, Dominate",
    color: {
      Fleeting: "#009600",
      Intense: "#00c800",
      Acute: "#00ff00",
    },
  },
  Empty: {
    name: "Empty",
    description: "Sociopaths, Psychopaths,\nEmotionally Detached",
    powers: "Oblivion",
    color: {
      Fleeting: "#6e6e6e",
      Intense: "#b5b5b5",
      Acute: "#ffffff",
    },
  },
};

"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");
const { EmbedBuilder } = require("discord.js");

module.exports = async function compulsionRoll(interaction) {
  interaction.args = getArgs(interaction);
  interaction.results = getResults(interaction);
  return { embeds: [getEmbed(interaction)] };
};

function getArgs(interaction) {
  return {
    clan: interaction.options.getString("clan"),
    no_clan: interaction.options.getBoolean("no_clan"),
    notes: interaction.options.getString("notes"),
  };
}

function getResults(interaction) {
  const args = interaction.args;
  const dice = args.no_clan ? Roll.single(9) : Roll.single(10);
  return {
    dice: dice,
    compulsion: getCompulsion(dice),
    clanCompulsion: getClanCompulsion(args.clan, dice),
  };
}

function getCompulsion(dice) {
  if (dice <= 3) return Compulsion.HUNGER;
  else if (dice <= 5) return Compulsion.DOMINANCE;
  else if (dice <= 7) return Compulsion.HARM;
  else if (dice <= 9) return Compulsion.PARANOIA;
  else return Compulsion.CLAN;
}

function getClanCompulsion(clan, dice) {
  if (!clan || dice !== 10) return null;
  else return ClanCompulsion[clan];
}

function getEmbed(interaction) {
  const results = interaction.results;
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

  let title = `${results.compulsion.name} Compulsion`;
  let description = results.compulsion.description;
  if (results.clanCompulsion) {
    title += `: ${results.clanCompulsion.name}`;
    description = results.clanCompulsion.description;
  }

  embed.setTitle(title);
  embed.setDescription(description);
  embed.setColor(results.compulsion.color);
  embed.setURL("https://realmofdarkness.app/");

  // Adding links to bottom of embed
  const links =
    "\n\n[Website](https://realmofdarkness.app/)" +
    " | [Commands](https://v5.realmofdarkness.app/)" +
    " | [Dice %](https://realmofdarkness.app/v5/dice/)" +
    " | [Patreon](https://www.patreon.com/MiraiMiki)";

  if (args.notes) {
    embed.addFields({ name: "Notes", value: args.notes });
    embed.data.fields.at(-1).value += links;
  } else embed.data.description += links;

  return embed;
}

const Compulsion = {
  HUNGER: {
    name: "Hunger",
    description:
      "The vampire's thoughts fixate on feeding. They will resort to violence, deception, or begging to satisfy their Hunger. Any action not directly related to feeding incurs a two-dice penalty. The Compulsion ends when the vampire slakes at least 1 Hunger level.\nPage 208 Corebook.",
    color: "#820000",
  },

  DOMINANCE: {
    name: "Dominance",
    description:
      "The vampire's Blood compels them to seek dominance and victory. Their next interaction becomes a competition, using any means to ensure victory and rub it in the loser's face. They cannot use teamwork and face a two-dice penalty for actions that avoid asserting dominance or challenging authority. The Compulsion ends once the vampire achieves a \"win\" and revels in their triumph.\nPage 208 Corebook",
    color: "#800080",
  },

  HARM: {
    name: "Harm",
    description:
      "The Hunger compels the vampire to inflict harm and destruction solely for the pleasure of causing pain. This may involve physical or more subtle harm, such as social or emotional damage.\nActions not resulting in harm receive a two-dice penalty. The Compulsion ends when the vampire incapacitates, destroys, or drives away a target. If the vampire targets an object, it must hold significant value to someone they deeply care about (including themselves).\nPage 209 Corebook",
    color: "#d90000",
  },

  PARANOIA: {
    name: "Paranoia",
    description:
      "The vampire's need to be vigilant intensifies into full-blown paranoia. They become suspicious of everyone and everything, attempting to disengage from perceived threats. Any action not focused on immediate safety incurs a two-dice penalty. The Compulsion ends after roughly an hour in a secure location, like a rooftop with good visibility, their haven, or deep underground.\nPage 209 Corebook",
    color: "#177280",
  },

  CLAN: {
    name: "Clan",
    description:
      "The distinctive essences flowing down from the Antediluvians shape their descendants according to ancient patterns spanning millennia. Whether this Compulsion signifies inherited flaws, essential safety valves, or part of an enigmatic ancient ritual, it can prove troublesome at times.\n\nNote: Clan compulsions are unique to each individual clan. You should refer to the rule book for your specific clan to discover the full details of its unique Compulsion. Page 210 Corebook",
    color: "#a89327",
  },
};

const ClanCompulsion = {
  BANU_HAQIM: {
    name: "Judgment",
    description:
      "The vampire is compelled to punish those who violate their personal code by taking their blood as a form of righteous retribution. For one scene, the vampire must feed on at least one Hunger from anyone, friend or foe, who goes against one of their Convictions. Failure to do so results in a three-dice penalty to all rolls until the Compulsion is fulfilled or the scene concludes. If the individual fed upon is also a vampire, a Bane-induced Hunger frenzy test should be performed.\nPage 18 Players Guide",
  },

  BRUJAH: {
    name: "Rebellion",
    description:
      "The vampire rebels against the current situation, opposing their leader, differing viewpoints, or assigned tasks. Until they challenge orders or expectations, real or perceived, they suffer a two-dice penalty to all rolls. This Compulsion ends when they succeed in convincing others to change their minds, even through force, or when they act contrary to expectations.\nPage 210 Corebook",
  },

  GANGREL: {
    name: "Feral Impulses",
    description:
      "The vampire reverts to an animalistic state, losing their ability to articulate fully and feeling discomfort in clothing. During this scene, they suffer a three-dice penalty to all rolls involving Manipulation and Intelligence. Their speech is limited to one-word sentences.\nPage 210 Corebook",
  },

  HECATA: {
    name: "Morbidity",
    description:
      "The vampire is driven by an urgent desire to move something from life to death or vice versa. Any action not dedicated to ending or resurrecting something incurs a two-dice penalty. This subject can be a person, living thing, object, or even something abstract like an idea or conversation. The Compulsion persists until the vampire successfully causes the transition, whether it be killing or reviving something, either literally or metaphorically.\nPage 24 Players Guide",
  },

  LASOMBRA: {
    name: "Ruthlessness",
    description:
      "Lasombra loathe failure, viewing it as a sign of poor planning or personal weakness. This compulsion drives them to take any imaginable action to achieve their goals, whether in the moment or through elaborate schemes spanning centuries. Any setback deeply affects them, and they quickly resort to ruthless methods to succeed.\nUpon failing any action, the vampire receives a two-dice penalty to all rolls until they successfully accomplish the same action in a future attempt or until the scene ends. This penalty also applies to future attempts at the triggering action.\nPage 30 Players Guide",
  },

  MALKAVIAN: {
    name: "Delusion",
    description:
      "The Malkavian's heightened senses lead them into a world of possibly genuine truths or omens, though others dismiss these visions as mere products of their Hunger-induced imagination. While they can still function, their mind and perceptions become skewed. During one scene, the vampire suffers a two-dice penalty to rolls involving Dexterity, Manipulation, Composure, and Wits, as well as rolls to resist terror frenzy.\nPage 210 Corebook",
  },

  MINISTRY: {
    name: "Transgression",
    description:
      "Driven by the Clan of Faith's belief in breaking mental and spiritual chains, feels an intense urge to liberate others from their self-imposed restrictions. They suffer a two-dice penalty to all dice pools except those involving enticing someone (even themselves) to break a Chronicle Tenet or personal Conviction, resulting in at least one Stain and ending the Compulsion.\nPage 36 Players Guide",
  },

  NOSFERATU: {
    name: "Cryptophilia",
    description:
      "The vampire is consumed by a relentless hunger for knowledge, a need to uncover exclusive and hidden truths, akin to their thirst for blood. They withhold secrets from others, only exchanging them in strict barter for more valuable ones.\nAny action not directed towards uncovering a secret incurs a two-dice penalty. The Compulsion concludes when the vampire discovers a significant and useful secret, and whether they choose to share it remains optional.\nPage 210 Corebook",
  },

  RAVNOS: {
    name: "Tempting Fate",
    description:
      "The vampire's Blood drives them to seek out perilous situations. Any attempt at a solution that isn't daring or risky incurs a two-dice penalty, while flamboyant and perilous approaches may receive bonus dice. The Compulsion endures until the problem is resolved or further attempts become impossible.\nPage 42 Players Guide",
  },

  SALUBRI: {
    name: "Affective Empathy",
    description:
      "The Salubri is overwhelmed with empathy for someone in the scene facing a personal problem. They feel compelled to assist in resolving the issue. Any action not aimed at mitigating the individual's struggle incurs a two-dice penalty. The Compulsion endures until the sufferer's burden is eased, a more pressing crisis takes precedence, or the scene concludes.\nPage 48 Players Guide",
  },

  TOREADOR: {
    name: "Obsession",
    description:
      "The Toreador becomes captivated by one exquisite thing, be it a person, song, artwork, or even a sunrise. They can hardly divert their attention and only speak about the beloved subject. All other actions suffer a two-dice penalty. The Compulsion persists until they lose sight of the object of their fascination or the scene concludes.\nPage 210 Corebook",
  },

  TREMERE: {
    name: "Perfectionism",
    description:
      "The Tremere demands nothing less than excellence. Until the vampire scores a critical win on a Skill roll or the scene concludes, they suffer a two-dice penalty to all dice pools. The penalty reduces to one die for a repeated action and is removed entirely upon the second repeat.\nPage 210 Corebook",
  },

  TZIMISCE: {
    name: "Covetousness",
    description:
      "The Tzimisce becomes fixated on acquiring something in the scene, adding it to their collection. Any action not directed towards obtaining the object incurs a two-dice penalty. The Compulsion remains until they secure ownership or the desired item becomes unattainable.\nPage 54 Players Guide",
  },

  VENTRUE: {
    name: "Arrogance",
    description:
      "The Ventrue is driven by the need to rule and assumes control of any situation. Someone must obey an order from the vampire. Any action not related to leadership receives a two-dice penalty. The Compulsion persists until an order is obeyed, without supernatural enforcement like Dominate.\nPage 211 Corebook",
  },
};

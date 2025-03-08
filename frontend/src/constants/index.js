export function getClans() {
  return [
    "Banu Haqim",
    "Brujah",
    "Gangrel",
    "Hecata",
    "Lasombra",
    "Malkavian",
    "Ministry",
    "Nosferatu",
    "Ravnos",
    "Salubri",
    "Toreador",
    "Tremere",
    "Tzimisce",
    "Ventrue",
    "Caitiff",
    "Thin Blood"
  ];
}

const CLAN_DETAILS = {
  'Banu Haqim': {
    description: 'Once known as Assamites, these Middle Eastern warriors now serve the Camarilla as judges and executioners.',
    disciplines: 'Blood Sorcery, Celerity, Obfuscate',
    bane: 'The Blood is All. Each time they taste Vampiric blood, must check for frenzy with Difficulty 2 plus the number of times already tasted vampire blood this night.',
    compulsion: 'Judge: Must deliver their personal judgment on a situation they deem unjust.'
  },
  'Brujah': {
    description: 'Rebels and provocateurs who rage against the status quo, the Brujah are rebels with a thousand causes.',
    disciplines: 'Celerity, Potence, Presence',
    bane: 'Rage of Caine. Always suffer a two-dice penalty to resist frenzy.',
    compulsion: 'Rebellion: Must rage against whatever they perceive as the status quo.'
  },
  'Gangrel': {
    description: 'Animalistic wanderers and survivalists who feel the constant pull of the Beast.',
    disciplines: 'Animalism, Fortitude, Protean',
    bane: 'Mark of the Beast. Each frenzy leaves a permanent animal trait until next torpor.',
    compulsion: 'Feral Impulses: Must give in to a bestial urge.'
  },
  'Hecata': {
    description: 'A recent amalgamation of death-focused bloodlines, including Giovanni and Harbingers of Skulls.',
    disciplines: 'Auspex, Fortitude, Oblivion',
    bane: 'The Hecata Kiss. Their bite causes excruciating pain to victims.',
    compulsion: 'Morbidity: Must engage with death in some way.'
  },
  'Lasombra': {
    description: 'Former Sabbat leaders now seeking admission to the Camarilla, masters of shadow and power.',
    disciplines: 'Dominate, Oblivion, Potence',
    bane: 'Dark Mirror. No reflection in mirrors, distorted or missing in digital images.',
    compulsion: 'Need for Control: Must assert dominance over a situation.'
  },
  'Malkavian': {
    description: 'Cursed with insight, each Malkavian experiences a unique form of madness that brings both wisdom and suffering.',
    disciplines: 'Auspex, Dominate, Obfuscate',
    bane: 'Fractured Perspective. Each Malkavian has at least one permanent mental derangement.',
    compulsion: 'Delusion: Must act according to their derangement.'
  },
  'Ministry': {
    description: 'Former Followers of Set rebranded for modern nights, corrupting through faith and vice.',
    disciplines: 'Obfuscate, Presence, Protean',
    bane: 'Faith\'s Flaw. Take aggravated damage from exposure to faith symbols wielded by true believers.',
    compulsion: 'Tempter: Must corrupt or tempt someone into transgressing their beliefs.'
  },
  'Nosferatu': {
    description: 'Cursed with horrible disfigurement, these information brokers dwell in the shadows of society.',
    disciplines: 'Animalism, Obfuscate, Potence',
    bane: 'Repulsive Presence. Cannot hide their monstrous appearance except through supernatural means.',
    compulsion: 'Cryptophilia: Must acquire and keep a secret.'
  },
  'Ravnos': {
    description: 'Once nomadic tricksters from India, the Ravnos were decimated by the Week of Nightmares. Modern survivors are reality-bending deceivers who struggle with their karmic curse while trying to rebuild their clan. Their powers of illusion and deception make them both feared and mistrusted by other kindred.',
    disciplines: 'Animalism, Presence, Chimerstry',
    bane: 'Each Ravnos has a specific vice or criminal act they must indulge in regularly. Resisting this vice increases difficulty of all rolls.',
    compulsion: 'Trickery: Must create an elaborate deception or illusion to achieve their goals, even when a simpler solution exists.'
  },
  'Salubri': {
    description: 'Once nearly extinct, these mystical warriors and healers are slowly returning. Known for their distinctive third eye and divided into two paths: peaceful Obi healers and warrior Wu judges. Historically hunted by the Tremere and considered "soul-eaters" by other vampires, they struggle to find their place in modern nights while maintaining their sacred traditions.',
    disciplines: 'Auspex, Fortitude, Valeren',
    bane: 'Their third eye visibly manifests when using Disciplines or feeding, making them easily identifiable. Many vampires still distrust them due to centuries of Tremere propaganda.',
    compulsion: 'Mercy: Must aid those in genuine need, even at personal cost or risk.'
  },
  'Toreador': {
    description: 'The Clan of the Rose, artists and aesthetes who walk a fine line between creative genius and decadent excess. They are patrons of the arts, trend-setters, and social butterflies of vampire society. Their passion for beauty in all its forms leads them to embrace both high culture and underground scenes, though their perfectionism can lead to obsession and paralysis.',
    disciplines: 'Auspex, Celerity, Presence',
    bane: 'When encountering something of extraordinary beauty or artistic merit, must make a Willpower check (Difficulty 4) or become entranced for a scene, unable to take any action except appreciating it.',
    compulsion: 'Perfection: Must achieve flawlessness in their chosen art or passion, often leading to repeated attempts and mounting frustration.'
  },
  'Tremere': {
    description: 'Blood sorcerers and occult scholars, recently weakened by the loss of their pyramid structure.',
    disciplines: 'Auspex, Blood Sorcery, Dominate',
    bane: 'Deficient Blood. Cannot create Blood Bonds through their vitae; must drink from others to create them.',
    compulsion: 'Obsession: Must pursue magical knowledge or power.'
  },
  'Tzimisce': {
    description: 'Fiercely territorial vampires obsessed with evolution and transformation.',
    disciplines: 'Animalism, Dominate, Protean',
    bane: 'Grounded in the Earth. Must rest with at least two handfuls of their native soil.',
    compulsion: 'Covetous: Must possess something or someone completely.'
  },
  'Ventrue': {
    description: 'Blue-blooded leadership of the Camarilla who maintain the Masquerade through influence and power.',
    disciplines: 'Dominate, Fortitude, Presence',
    bane: 'Rarefied Tastes. Can only feed from a specific type of mortal chosen at character creation.',
    compulsion: 'Lord\'s Will: Must assert authority over others.'
  },
  'Caitiff': {
    description: 'The clanless, lacking the inherent powers and teachings of the recognized clans.',
    disciplines: 'Three disciplines of player\'s choice',
    bane: 'No clan disciplines. Experience cost for all disciplines as out-of-clan.',
    compulsion: 'No clan compulsion, but suffer increased difficulty in vampire society.'
  },
  'Thin Blood': {
    description: '14th and 15th generation vampires, barely able to maintain their undead existence.',
    disciplines: 'Thin-Blood Alchemy only',
    bane: 'Cannot use most vampire powers. Blood Potency 0. Can potentially survive sunlight.',
    compulsion: 'None, but subject to Thin-Blood Merits and Flaws.'
  }
};

export const getClanInfo = (clanName) => {
  return CLAN_DETAILS[clanName];
};

export function getPredatorTypes() {
  return [
    "Alleycat",
    "Bagger",
    "Blood Leech",
    "Cleaver",
    "Consensualist",
    "Farmer",
    "Osiris",
    "Sandman",
    "Scene Queen",
    "Siren",
    "Extortionist",
    "Graverobber",
    "Roadside Killer",
    "Grim Reaper",
    "Montero",
    "Pursuer",
    "Trapdoor",
  ];
}

/**
 * Gateway opcodes
 */
export const GATEWAY_OPCODE = {
  dispatch: 0, // Recieve events
  request: 1, // Send events
  heartbeat: 2, // Send/Recieve heatbeats
  identify: 3, // Identify self
  welcome: 4, // Sent immediately after connecting
  heartbeatACK: 5, // sent in response to receiving a heatbeat
  refresh: 6, // Tempory code to refresh all gateway data
};
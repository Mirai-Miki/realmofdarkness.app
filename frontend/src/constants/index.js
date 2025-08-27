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
    "Thin Blood",
  ];
}

const CLAN_DETAILS = {
  "Banu Haqim": {
    description:
      "The Judges of the Banu Haqim are torn between their hereditary thirst for vampiric Blood and their passion for justice. Stern adjudicators, they are fiercely devoted to upholding a moral code, and Embrace mortals capable of assessing and handling threats, enforcing laws and traditions, and punishing transgressors.",
    disciplines: "Blood Sorcery, Celerity, Obfuscate",
    bane: "Blood Addiction - When the Banu Haqim slakes at least one Hunger level from another vampire, they must make a Hunger Frenzy test at difficulty 2 plus Bane Severity. If they fail, they must gorge themselves on vitae, in turn opening the door to possible Diablerie.",
    variantBane:
      "Noxious Blood - The Blood of the Banu Haqim is toxic to mortals, but not to other vampires. Due to this mortals receive Aggravated Damage equal to the Bane Severity of the vampire for each Rouse Check's worth of Blood consumed.",
    compulsion:
      "Judgement - Urged to punish a wrongdoer, the vampire must slake one Hunger from anyone that acts against their own Convictions. Failing to do so results in a three-dice penalty to all rolls until the Compulsion is satisfied or the scene ends.",
  },
  Brujah: {
    description:
      "The Brujah are a clan of radicals and troublemakers, Embracing those willing to put someone in their place if the situation calls for it. Most see themselves as warriors with a cause, and these Rebels are guided by their passions, strength, and dedication to their ideals — whatever those may be.",
    disciplines: "Celerity, Potence, Presence",
    bane: "Violent Temper - A rage is simmering in the back of the mind with a Brujah with the slightest provocation able to send them into a frenzied rage. Subtracts dice equal to the Bane Severity of the Brujah against Fury Frenzy.",
    variantBane:
      "Violence - When a messy critical occurs as the result of any Skill test outside of combat, a Brujah vampire causes damage to the subject of their interaction equal to their Bane Severity, in addition to any other result of the Hunger dice. The damage is Aggravated unless the player spends a point of Willpower to turn it into Superficial.",
    compulsion:
      "Rebellion - The Brujah craves to take a stance against those who represent the status quo. This does not relent until they have gone against orders, expectations, or changed someone's mind. During this Compulsion, they suffer a -2 to dice all pools.",
  },
  Gangrel: {
    description:
      "Often closer to beasts than other vampires, the Gangrel style themselves apex predators. These Ferals prowl the wilds as easily as the urban jungle, and no clan of vampires can match their ability to endure, survive, and thrive in any environment. Often fiercely territorial, their shapeshifting abilities even give the undead pause.",
    disciplines: "Animalism, Fortitude, Protean",
    bane: "Bestial Features - In Frenzy, Gangrel gains animalistic features equal to their Bane Severity. These features last for one more night afterward, each feature reducing one Attribute by 1 point. The Gangrel may choose to Ride the Wave in order to only have one feature manifest and only lose one Attribute point.",
    variantBane:
      "Survival Instincts - Subtract dice equal to the Bane Severity in any roll to resist fear Frenzy. The pool cannot be below one die.",
    compulsion:
      "Feral Impulses - Unleash the animal hidden in their Blood. This urges the Gangrel to regress into an animalistic state where speech becomes difficult, clothes become too constrictive and arguments are best settled with claws and teeth. For one scene the Gangrel suffers a -3 dice penalty to all rolls involving Manipulation and Intelligence as they are only able to speak one word sentences.",
  },
  Hecata: {
    description:
      "A motley collection of necromantic vampire bloodlines, the Hecata clan are united in the pursuit of a single subject: Death. They are students of the afterlife and resurrectionists of the dead — or worse. Selling their services to the highest bidder, or acting in their own interests, there are few who can hide from the surveillance of those who can summon and command the very spirits of the deceased.",
    disciplines: "Auspex, Fortitude, Oblivion",
    bane: "Painful Kiss - Hecata may only take harmful drinks from mortals which result in blood loss. Unwilling mortals that are able to escape will make the attempt, even those who are convinced or willing must succeed in a Stamina + Resolve test against Difficulty 2 + Bane Severity in order to not recoil. Vampires who are willingly bit must make a Frenzy test against Difficulty 3 to avoid terror Frenzy.",
    variantBane:
      "Decay - Hecata suffer additional dots in Flaws equal to their Bane Severity spread as they see fit across Retainer, Haven, and Resources Flaws. These Flaws can either be taken at Character Creation or removed by paying twice the amount of Background dots. Additionally, any purchase of dots in these Advantages costs an additional amount of experience points equal to their Bane Severity.",
    compulsion:
      "Morbidity - The vampire must move something from life to death or vice versa, any action not taken to end or resurrect something suffers a two-dice penalty. The subject does not have to be a living thing and can instead be an object or more abstract such as ideas or conversation points. This Compulsion lasts until they manage to kill or return something to life.",
  },
  Lasombra: {
    description:
      "Creatures subtly at odds with mundane reality, Lasombra vampires are expected to triumph at any cost. Ruthlessness is a sought-after trait in progeny, making their reputation as betraying interlopers well deserved. Most do not seek attention, preferring to act as puppeteers, powers behind the proverbial throne. To a Shadow, the ends justify any means.",
    disciplines: "Dominate, Oblivion, Potence",
    bane: "Distorted Image - In reflections or recordings (live or not) the Lasombra appear to be distorted; those who know what vampires are know precisely what's going on, while others might be confused but know something is wrong. In addition to this, modern technology which includes making a phone call requires a Technology test at Difficulty 2 + Bane Severity as microphones struggle with them as much as cameras.",
    variantBane:
      "Callousness - Whenever making a Remorse test remove a number of dice equal to the Bane Severity. The dice pool cannot be reduced below 1.",
    compulsion:
      "Ruthlessness - The next time the vampire fails an action they receive a two-dice penalty to all rolls until a future attempt at the same action succeeds. This penalty applies to future attempts of the same action still.",
  },
  Malkavian: {
    description:
      'Derided as Lunatics by other vampires, the Blood of the Malkavians lets them perceive and foretell truths hidden from others. Like the "wise madmen" of poetry their fractured perspective stems from seeing too much of the world at once, from understanding too deeply, and feeling emotions that are just too strong to bear.',
    disciplines: "Auspex, Dominate, Obfuscate",
    bane: "Fractured Perspective - When suffering a Bestial Failure or a Compulsion, their mental derangement comes to the forefront. Suffers a penalty equal to their Bane Severity to one category of dice pools (Physical, Social or Mental) for the entire scene. The penalty and nature of the affliction are decided between the player and Storyteller during character creation.",
    variantBane:
      "Unnatural Manifestations - Using Discipline powers within close proximity of mortals scares them and any social interactions other than Intimidation suffer a dice penalty equal to their Bane Severity. This is not Masquerade-breaking, but the dislike remains for the duration of one scene. Other vampires subject to this recognize the Malkavian as a vampire but suffer no penalty.",
    compulsion:
      "Delusion - Whether it's figments of their imagination or extrasensory perception of the truths. For one scene, the Malkavian suffers a 2 dice penalty to rolls involving Dexterity, Manipulation, Composure, and Wits. As well as rolls to resist terror Frenzy.",
  },
  Ministry: {
    description:
      "The Ministry always has something to offer. This often cult-like clan recruits those able to employ temptation as a weapon. They Embrace those with the will and means to sway, entrap, and ultimately liberate their targets from whatever they seek: the victim's possessions, allegiance, or even faith. To the Serpents, everything has a price.",
    disciplines: "Obfuscate, Presence, Protean",
    bane: "Abhors the Light - When a Minister is exposed to direct illumination, be it naturally caused or artificial, they receive a penalty equal to their Bane Severity to all dice pools while subject to the light. They also add their Bane Severity to Aggravated damage taken from sunlight.",
    variantBane:
      "Cold-Blooded - They can only use Blush of Life if they have recently fed from a living vessel in the same scene or up to roughly an hour ago, Storytellers discretion. When they do so, it requires a number of Rouse Checks equal to their Bane Severity rather than just one.",
    compulsion:
      "Transgression - The Minister suffers a burning desire to influence those around them to shatter the chains of their own making. They suffer a two-dice penalty to all dice pools that do not relate to enticing someone or themselves to break a Chronicle or personal Conviction. The Compulsion ends once the Minister causes someone, or themselves, at least one stain.",
  },
  Nosferatu: {
    description:
      "The Nosferatu wear their curse on the outside. Their bodies horribly twisted and deformed through the Embrace, they lurk on the fringes of most cities, acting as spies and brokers of information. Using animals and their own supernatural capacity to hide, nothing escapes the eyes of the so-called Sewer Rats.",
    disciplines: "Animalism, Obfuscate, Potence",
    bane: "Repulsiveness - Cursed by their blood, when they are Embraced they are twisted into revolting monsters. They can never raise their rating in the Looks merits and instead must take the (••) Repulsive flaw. Any attempt to disguise themselves incurs a penalty equal to the character's Bane Severity, this also includes the use of Disciplines such as Mask of a Thousand Faces.",
    variantBane:
      "Infestation - The Haven of a Nosferatu is always infested with vermin, any attempt to do something that requires concentration takes a two plus Bane Severity penalty, as well as the same penalty to social tests at ST discretion. Additionally, when a Nosferatu spends a scene at an enclosed location, the vermin appears and causes the same penalty though reduced to equal only the Bane Severity.",
    compulsion:
      "Cryptophilia - Consumed by a hunger for private secrets, the Nosferatu seeks to obtain knowledge no matter big or small as long as it's not a well-known bit of information. During this, they also refuse to give up their secrets except in strict trade for something greater than their own. Any action not actively working towards gaining them a secret they take a two-dice penalty. This Compulsion does not end till they learn a secret they deem to be useful.",
  },
  Ravnos: {
    description:
      "Masters of misdirection, the Ravnos prefer not to fight or bleed for something they can obtain through subtler means. They can charm and vanish within the same mortal breath, and those once fooled quickly learn to question their very senses when in the company of Ravens. Always on the move, the Ravnos can never rest in the same place for long lest their curse light them on fire as they slumber.",
    disciplines: "Animalism, Presence, Chimerstry",
    bane: "Doomed - Anytime they daysleep within the same place more than once in seven nights, roll a number of dice equal to their Bane Severity. If they receive any 10's they then take 1 Aggravated damage for each as they are scorched from within. What constitutes as the same place is defined by the chronicle, but generally will need a mile distance between the two resting places before the bane is triggered.",
    variantBane:
      "Unbirth Name - If a Ravnos' unbirth name is used against them, the name-wielding opponent receives a bonus equal to the Ravnos' Bane Severity to resist their Discipline powers. Additionally, the Ravnos affected receives the same penalty to resist supernatural powers used by the opponent.",
    compulsion:
      "Tempting Fate - When faced with their next problem, the Daredevil must attempt the solution with the most dangerous or daring of actions, anything less incurs a two-dice penalty. Context appropriate flashy or risky attempts may even net bonus dice. They are free to convince others to follow them in their actions but may as well go it alone. This Compulsion persists until the problem is solved or further attempts become impossible to accomplish.",
  },
  Salubri: {
    description:
      "Most of their kind lost to undead usurpers, the highly desirable Blood of the hunted Salubri is a prize to other vampires. This, and their reluctance to Embrace, makes them rare in the modern nights. They often recruit those on the edge of death, believing their curse can provide the worthy a second chance, and they count some of the most humane vampires among their ranks.",
    disciplines: "Auspex, Fortitude, Valeren",
    bane: "Hunted - Their vitae has a unique trait where, when another clan partakes in their Blood, they find it difficult to pull away. Once a non-Salubri has consumed at least one Hunger level worth, they must make a Hunger Frenzy test at difficulty 2 + the Salubri's Bane Severity. Additionally, each Salubri has a third eye, and while it's not always human-like, it's always present and cannot be obscured by supernatural powers. Whenever they activate a Discipline, the eye weeps vitae.",
    variantBane:
      "Asceticism - Whenever their Hunger is below three, the Salubri suffer a penalty equal to their Bane Severity to any Discipline dice pools. The bleeding third eye still remains.",
    compulsion:
      "Affective Empathy - Overwhelmed with empathy for a personal problem of someone else, any action not taken to help the person mitigate their suffering is at a two-dice penalty. This Compulsion continues until the sufferer's burden is eased, a more critical problem arises, or the scene ends.",
  },
  Toreador: {
    description:
      "Known for their seductive nature, enthralling demeanor, and eloquent grace to the point of obsession, Toreador vampires Embrace artists and lovers into their ranks, forever trying to stir their own deadened hearts. Supernaturally graceful and charming, the Divas are always looking for the next thrill, leaving a detritus of discarded lovers and victims in their wake.",
    disciplines: "Auspex, Celerity, Presence",
    bane: "Aesthetic Fixation - When encountering something of beauty (Difficulty 4 or above) whether it be a person, an object, a song, a speech, an aspect of nature, or anything else, the character must make a Composure + Resolve test at Difficulty 4. Failure causes them to become distracted by the beautiful thing and unable to take any action for a number of turns equal to their Bane Severity other than staring, listening, etc. This bane has no effect in combat.",
    variantBane:
      "Superficial - When suffering a Stain from a situation other than killing or sacrificing another, immediately gain an additional Stain. They also suffer a dice penalty equal to their Bane Severity when making Remorse tests.",
    compulsion:
      "Obsession - The next time they fail at any action, they become obsessed with their failure and cannot willingly fail or botch any subsequent attempt for the rest of the scene. Each failed attempt to succeed also inflicts a -1 die penalty to their next roll of the same type, cumulative up to -5 dice.",
  },
  Tremere: {
    description:
      "The arcane Clan Tremere were once a house of mortal mages who sought immortality but found only undeath. As vampires, they've perfected ways to bend their own Blood to their will, employing their sorceries to master and ensorcel both the mortal and vampire world. Their power makes them valuable, but few vampires trust their scheming ways.",
    disciplines: "Auspex, Blood Sorcery, Dominate",
    bane: "Deficient Blood - Before the fall of Vienna, they were defined by their rigid hierarchy of Blood Bonds within the Pyramid. After the fall, their Blood weakened and rejected all prior connections. Tremere are unable to Blood Bond other Kindred, though they can still be Bound by other clans. Tremere can still Blood Bond mortals to do their bidding, but their corrupted vitae must be drunk an additional amount of times equal to their Bane Severity.",
    variantBane:
      "Stolen Blood - When performing a Blood Surge they need to make Rouse Checks equal to their Bane Severity. If these Rouse Checks increase their Hunger to 5 or higher, they can choose whether to back off their Blood Surge or perform it to then hit Hunger 5 afterward immediately.",
    compulsion:
      "Perfectionism - Nothing but the best will satisfy them, anything less than exceptional still instills a profound sense of failure. When afflicted by this, the Warlock suffers a two-dice penalty to all dice pools. The penalty is reduced to one die when actions are being repeated and removed entirely on a second repeat. This does not end till they managed to score a critical win on a Skill roll or the scene ends.",
  },
  Tzimisce: {
    description:
      "The dragons view ownership above all, they aim to conquer and rule the subject of their possessiveness. Traditionally their charges were based on geographical locations, but in the modern age, the younger generations have taken a more loose approach, staking claim over mortals rather than their land. Their desire to own is only limited by their lack of expansion, but once they've sunk their claws in they are hard to shake loose.",
    disciplines: "Animalism, Dominate, Protean",
    bane: "Grounded - Each Tzimisce must select a specific charge, be it physical location, a group of people, or something even more esoteric. Each night they must sleep surrounded by their charge, if they do not, they sustain aggravated Willpower damage equal to their Bane Severity upon waking the following night.",
    variantBane:
      "Cursed Courtesy - If they wish to enter a place of residence uninvited they must spend Willpower equal to their Bane Severity, this penalty also applies to their Discipline pools while they are there. The invitation inside can only be made by someone who lives there and this does not occur in uninhabited homes or public places. Tzimisce with this Bane cannot take the uninvited Folkloric Block.",
    compulsion:
      "Covetousness - When afflicted with this compulsion they become obsessed with owning something in the scene, be it an object, or property to a living person. Whatever it is, they must add it to their collection and any action taken not towards this purpose incurs a two-dice penalty. This penalty continues until ownership is established or the object of their desire is unobtainable.",
  },
  Ventrue: {
    description:
      "The Ventrue are not called the Clan of Kings for nothing. Carefully choosing their progeny from mortals familiar with power, wealth, and influence, the Ventrue style themselves the aristocrats of the vampire world. Their members are expected to assume command wherever possible, and they're willing to endure storms for the sake of leading from the front.",
    disciplines: "Dominate, Fortitude, Presence",
    bane: "Rarefied Tastes - When the Ventrue drinks the blood of a mortal who does not fall within their preference, they must spend Willpower equal to their Bane Severity else they will vomit the blood from their bodies unable to slake their hunger. Their preferences range within the clan, some looking for descendants of a certain nationality to soldiers suffering from PTSD. With a Resolve + Awareness test, they can sense if a mortal they seek to feed from fits within their preference.",
    variantBane:
      "Hierarchy - The Ventrue suffer a penalty equal to their Bane Severity to their Discipline dice pools when using them against a vampire of a lower generation. They must also spend Willpower equal to this penalty if they wish to directly attack other vampires of a lower generation.",
    compulsion:
      "Arrogance - Fueled by the beast and their natural desire for power, the Ventrue must force someone to obey a command given. The order cannot be given through supernatural means such as Dominate. Until they satisfy the requirements, they receive a two-dice penalty for any actions not directly related to leadership.",
  },
  Caitiff: {
    description:
      "Caitiff exhibit no discernible lineage, the Caitiff are vampires without a clan. Distrusted by their peers, they are scorned because of their lack of lineage but also feared for their unpredictability. Jacks of all trades but masters of none, each Pander makes their own way in the society of the damned, free from ancestry and expectations both.",
    disciplines: "Three disciplines of player's choice",
    bane: "Outcast - Untouched by their ancestors, the Caitiff do not share a common Bane. The character begins with the Flaw Suspect (•) and they may not purchase positive status during Character Creation. The Storyteller may impose a 1-2 dice penalty to social tests against Kindred who know they are Caitiff. To improve a Discipline, the cost is 6 times the level of experience points.",
    variantBane: "No variant bane",
    compulsion:
      "No clan compulsion - Caitiff do not have a clan Compulsion, but suffer increased difficulty in vampire society.",
  },
  "Thin Blood": {
    description:
      "Neither entirely vampire nor mortal, Thin-bloods are high-generation vampires (14th-16th) whose distance from Caine leaves them weakened but adaptable. Often cast out and shunned by Kindred society, they band together and leverage their resistance to sunlight and mercurial alchemy against their oppressors. They can potentially return to mortality or ascend through diablerie.",
    disciplines: "Thin-Blood Alchemy",
    bane: "Blood Potency 0 - Cannot use most vampiric powers except through temporary Resonance feeding or Thin-blood Alchemy. Take damage as mortals. Cannot create reliable Blood Bonds or Embrace. Can only ghoul mortals for one night.",
    variantBane:
      "Clan Curse (Merit Required) - If the Thin-blood Flaw 'Clan Curse' is taken, they suffer from a specific clan's bane.",
    compulsion:
      "None - Thin-bloods do not suffer from clan Compulsions, though they may be subject to various Thin-blood Merits and Flaws that provide unique advantages and disadvantages.",
    additionalInfo:
      "Thin-bloods gain temporary Discipline access by feeding from specific Resonances - one dot and power from normal Resonance, two dots and powers from Intense or stronger. These abilities are lost at Hunger 5 or next feeding. Some resist frenzies and can walk in sunlight without harm. The Camarilla brands all Thin-bloods as a mark of their status.",
  },
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
    "Tithe Collector",
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

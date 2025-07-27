"use strict";
require("dotenv").config(); // Add this to load the environment variables

// Set up Unicode fallbacks for development environment
const isDev = process.env.NODE_ENV === "development";

// Define Discord emoji and Unicode fallbacks
const emojiDefinitions = {
  // Basic symbols
  ankh_red_fangs: ["<:ankh_red_fangs:814395210678927370>", "🦇 "],
  ankh_red: ["<:ankh_red:814396441828392982>", "🔴 "],
  crit_black: ["<:crit_black:814396519574143006>", "✨ "],
  red_period: ["<:red_period:814396574092361750>", "🔴 "],
  ankh_black: ["<:ankh_black:814396636793012254>", "☥ "],
  red_skull: ["<:red_skull:814397402185728001>", "💀 "],

  // Dots
  blank_dot: ["<:blank_dot:817641377826471936>", "⭕ "],
  red_dot: ["<:red_dot:817642148794335253>", "🔴 "],
  yellow_dot: ["<:yellow_dot:894443295533584384>", "🟡 "],
  purple_dot_1: ["<:purple_dot_1:894443929183871027>", "🟣 "],
  purple_dot_2: ["<:purple_dot_2:894443199140085780>", "🟣 "],
  purple_dot_3: ["<:purple_dot_3:820913320378236939>", "🟣 "],
  black_period: ["<:black_period:901323344450818109>", "⚫ "],

  // Boxes
  greenBox: ["<:greenBox:820909151328141312>", "🟩 "],
  yellowBox: ["<:yellowBox:820909188154523649>", "🟨 "],
  redBox: ["<:redBox:820909202678743061>", "🟥 "],
  purpleBox: ["<:purpleBox:825368831920177192>", "🟪 "],

  // Special symbols
  nightmare: ["<:nightmare:901432906227007488>", "😱 "],
  botch: ["<:botch:901438266312650772>", "💥 "],
  butterfly: ["<:butterfly:953616399799037982>", "🦋 "],
  despair: ["<:despair:984730957691113472>", "😱 "],

  // Dice numbers - Green
  green1: ["<:green1:901438137983701012>", "🟢1 "],
  green2: ["<:green2:901438140781326376>", "🟢2 "],
  green3: ["<:green3:901438140487720960>", "🟢3 "],
  green4: ["<:green4:901438140106035320>", "🟢4 "],
  green5: ["<:green5:901438141498544199>", "🟢5 "],
  green6: ["<:green6:901438140257017887>", "🟢6 "],
  green7: ["<:green7:901438141284614144>", "🟢7 "],
  green8: ["<:green8:901438140810682408>", "🟢8 "],
  green9: ["<:green9:901438141938941992>", "🟢9 "],
  green10: ["<:green10:901438140919709716>", "🟢10 "],

  // Dice numbers - Red
  red1: ["<:red1:901438193528881212>", "🔴1 "],
  red2: ["<:red2:901438197882564688>", "🔴2 "],
  red3: ["<:red3:901438198046134282>", "🔴3 "],
  red4: ["<:red4:901438197744152606>", "🔴4 "],
  red5: ["<:red5:901438198213910609>", "🔴5 "],
  red6: ["<:red6:901438198306197504>", "🔴6 "],
  red7: ["<:red7:901438197916123136>", "🔴7 "],
  red8: ["<:red8:901438199358963803>", "🔴8 "],
  red9: ["<:red9:901438198016774176>", "🔴9 "],
  red10: ["<:red10:901438198180376587>", "🔴10 "],

  // Vampire 5th edition Standard Dice
  red_fail: ["<:red_fail:901721705981046835>", "h❌ "],
  black_fail: ["<:black_fail:901721784976568360>", "v❌ "],
  black_crit: ["<:black_crit:901726422513614898>", "v✨ "],
  red_crit: ["<:red_crit:901726454734290994>", "h✨ "],
  black_pass: ["<:black_pass:901731712487288852>", "v✅ "],
  red_pass: ["<:red_pass:901731712558567474>", "h✅ "],
  bestial_fail: ["<:bestial_fail:901732920807546911>", "v💀 "],

  // Vampire 5th edition Alt dice
  V5_Hunger_BestialFailure: [
    "<:V5_Hunger_BestialFailure:1179636066140049468>",
    "h💀 ",
  ],
  V5_Hunger_Failure: ["<:V5_Hunger_Failure:1179636067868082256>", "h❌ "],
  V5_Hunger_MessyCritical: [
    "<:V5_Hunger_MessyCritical:1179636071265476639>",
    "h✨ ",
  ],
  V5_Hunger_Success: ["<:V5_Hunger_Success:1179636074910322698>", "h✅ "],
  V5_Regular_Critical: ["<:V5_Regular_Critical:1179636078441926656>", "v✨ "],
  V5_Regular_Failure: ["<:V5_Regular_Failure:1179636079863799900>", "v❌ "],
  V5_Regular_Success: ["<:V5_Regular_Success:1179636083722571987>", "v✅ "],

  // Hunter 5th edition standard dice
  hunter_crit: ["<:hunter_crit:984730243229184010>", "h🎯 "],
  hunter_fail: ["<:hunter_fail:984730246194561024>", "h❌ "],
  hunter_pass: ["<:hunter_pass:984730249260572692>", "h✅ "],
  desperation_crit: ["<:desperation_crit:984730961054957609>", "d🎯 "],
  desperation_fail: ["<:desperation_fail:984730964041281546>", "d❌ "],
  desperation_pass: ["<:desperation_pass:984730967719694367>", "d✅ "],

  // Hunter 5th edition
  H5_Desperation_Critical: [
    "<:H5_Desperation_Critical:1179635427112665128>",
    "d✨ ",
  ],
  H5_Desperation_Failure: [
    "<:H5_Desperation_Failure:1179635428962344961>",
    "d❌ ",
  ],
  H5_Desperation_OverreachOrDesp: [
    "<:H5_Desperation_OverreachOrDesp:1179635431906742363>",
    "d⚠️ ",
  ],
  H5_Desperation_Success: [
    "<:H5_Desperation_Success:1179635434968592474>",
    "d✅ ",
  ],
  H5_Regular_Critical: ["<:H5_Regular_Critical:1179635436969263114>", "h✨ "],
  H5_Regular_Failure: ["<:H5_Regular_Failure:1179635440035303484>", "h❌ "],
  H5_Regular_Success: ["<:H5_Regular_Success:1179635441767559229>", "h✅ "],

  // Werewolf 5th Standard dice
  brutal_result: ["<:brutal_result:1132978640339079269>", "w💥 "],
  w5_fail: ["<:w5_fail:1132978648765444177>", "w❌ "],
  w5_crit: ["<:w5_crit:1132983343500242954>", "w✨ "],
  w5_success: ["<:w5_success:1132983357052030976>", "w✅ "],
  rage_fail: ["<:rage_fail:1132978658101968956>", "r❌ "],
  rage_crit: ["<:rage_crit:1132983348256575509>", "r✨ "],
  rage_success: ["<:rage_success:1132983351616213023>", "r✅ "],

  // Werewolf 5th edition Alt dice
  W5_Rage_Brutal: ["<:W5_Rage_Brutal:1179636658426085397>", "r💥 "],
  W5_Rage_Critical: ["<:W5_Rage_Critical:1179636661743796326>", "r✨ "],
  W5_Rage_Failure: ["<:W5_Rage_Failure:1179636664075829330>", "r❌ "],
  W5_Rage_Success: ["<:W5_Rage_Success:1179636668513390632>", "r✅ "],
  W5_Regular_Critical: ["<:W5_Regular_Critical:1179636674976825344>", "w✨ "],
  W5_Regular_Failure: ["<:W5_Regular_Failure:1179636677078163536>", "w❌ "],
  W5_Regular_Success: ["<:W5_Regular_Success:1179636680702038067>", "w✅ "],

  // Logos
  logo_red: ["<:logo_red:973530234345377802>", "◆ "],
  logo_teal: ["<:logo_teal:973530234370555904>", "◆ "],
  logo_gold: ["<:logo_gold:973530234487975966>", "◆ "],

  // Supporter
  supporter_mortal: ["🩸", "🩸 "],
  supporter_fledgling: ["<:black_pawn~1:1387312189899276328>", "♟ "],
  supporter_neonate: ["<:black_knight:1387312181439107192>", "♞ "],
  supporter_ancilla: ["<:black_bishop~1:1387312187349008504>", "♝ "],
  supporter_elder: ["<:black_rook:1387312179526766632>", "♜ "],
  supporter_methuselah: ["<:black_queen:1387312183209099304>", "♛ "],
  supporter_antediluvian: ["<:black_king:1387312185608503296>", "♚ "],

  // Progress Bar Emojis
  green_left_full: [
    "<:green_left_full:1398957183093444658>",
    "<:green_left_full:1398957183093444658>",
  ],
  green_middle_empty: [
    "<:green_middle_empty:1398957171357650944>",
    "<:green_middle_empty:1398957171357650944>",
  ],
  green_middle_full: [
    "<:green_middle_full:1398957156899881040>",
    "<:green_middle_full:1398957156899881040>",
  ],
  green_right_full: [
    "<:green_right_full:1398957131389992960>",
    "<:green_right_full:1398957131389992960>",
  ],
  green_right_empty: [
    "<:green_right_empty:1398957112683659334>",
    "<:green_right_empty:1398957112683659334>",
  ],
  green_left_empty: [
    "<:green_left_empty:1398957095704985631>",
    "<:green_left_empty:1398957095704985631>",
  ],
  yellow_left_empty: [
    "<:yellow_left_empty:1398957081507139604>",
    "<:yellow_left_empty:1398957081507139604>",
  ],
  yellow_right_empty: [
    "<:yellow_right_empty:1398957067490037851>",
    "<:yellow_right_empty:1398957067490037851>",
  ],
  yellow_right_full: [
    "<:yellow_right_full:1398957050477805660>",
    "<:yellow_right_full:1398957050477805660>",
  ],
  yellow_middle_full: [
    "<:yellow_middle_full:1398957033327431781>",
    "<:yellow_middle_full:1398957033327431781>",
  ],
  yellow_middle_empty: [
    "<:yellow_middle_empty:1398957015929192478>",
    "<:yellow_middle_empty:1398957015929192478>",
  ],
  yellow_left_full: [
    "<:yellow_left_full:1398957000271990874>",
    "<:yellow_left_full:1398957000271990874>",
  ],
  red_left_full: [
    "<:red_left_full:1398956960933613653>",
    "<:red_left_full:1398956960933613653>",
  ],
  red_middle_full: [
    "<:red_middle_full:1398956933771431946>",
    "<:red_middle_full:1398956933771431946>",
  ],
  red_right_full: [
    "<:red_right_full:1398956912258711552>",
    "<:red_right_full:1398956912258711552>",
  ],
  red_right_empty: [
    "<:red_right_empty:1398956875936038923>",
    "<:red_right_empty:1398956875936038923>",
  ],
  red_middle_empty: [
    "<:red_middle_empty:1398956849193029703>",
    "<:red_middle_empty:1398956849193029703>",
  ],
  red_left_empty: [
    "<:red_left_empty:1398956822202945618>",
    "<:red_left_empty:1398956822202945618>",
  ],
};

// Convert to proper export structure
const emojiMap = {};
for (const [key, value] of Object.entries(emojiDefinitions)) {
  emojiMap[key] = isDev ? value[1] : value[0];
}

module.exports = emojiMap;

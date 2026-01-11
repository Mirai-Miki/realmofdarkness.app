/**
 * @file Auto-generated emoji type definitions
 * @description Generated from emoji files in the emojis/ directory
 * @warning Do not edit manually - run 'pnpm build' to regenerate
 */

import { z } from "zod";



/**
 * Zod schema for emoji name validation
 */
export const EmojiNameSchema = z.enum([
  "dice_h5_default_primary_crit",
  "dice_h5_default_primary_fail",
  "dice_h5_default_primary_pass",
  "dice_h5_default_secondary_choice",
  "dice_h5_default_secondary_crit",
  "dice_h5_default_secondary_fail",
  "dice_h5_default_secondary_pass",
  "dice_h5_wod_primary_crit",
  "dice_h5_wod_primary_fail",
  "dice_h5_wod_primary_pass",
  "dice_h5_wod_secondary_choice",
  "dice_h5_wod_secondary_crit",
  "dice_h5_wod_secondary_fail",
  "dice_h5_wod_secondary_pass",
  "dice_v5_default_primary_crit",
  "dice_v5_default_primary_fail",
  "dice_v5_default_primary_pass",
  "dice_v5_default_secondary_bestial",
  "dice_v5_default_secondary_crit",
  "dice_v5_default_secondary_fail",
  "dice_v5_default_secondary_pass",
  "dice_v5_wod_primary_crit",
  "dice_v5_wod_primary_fail",
  "dice_v5_wod_primary_pass",
  "dice_v5_wod_secondary_bestial",
  "dice_v5_wod_secondary_crit",
  "dice_v5_wod_secondary_fail",
  "dice_v5_wod_secondary_pass",
  "dice_w5_default_primary_crit",
  "dice_w5_default_primary_fail",
  "dice_w5_default_primary_pass",
  "dice_w5_default_secondary_brutal",
  "dice_w5_default_secondary_crit",
  "dice_w5_default_secondary_fail",
  "dice_w5_default_secondary_pass",
  "dice_w5_wod_primary_crit",
  "dice_w5_wod_primary_fail",
  "dice_w5_wod_primary_pass",
  "dice_w5_wod_secondary_brutal",
  "dice_w5_wod_secondary_crit",
  "dice_w5_wod_secondary_fail",
  "dice_w5_wod_secondary_pass",
  "dice_wod20_default_fail_1",
  "dice_wod20_default_fail_10",
  "dice_wod20_default_fail_2",
  "dice_wod20_default_fail_3",
  "dice_wod20_default_fail_4",
  "dice_wod20_default_fail_5",
  "dice_wod20_default_fail_6",
  "dice_wod20_default_fail_7",
  "dice_wod20_default_fail_8",
  "dice_wod20_default_fail_9",
  "dice_wod20_default_fail_botch",
  "dice_wod20_default_nightmare",
  "dice_wod20_default_pass_1",
  "dice_wod20_default_pass_10",
  "dice_wod20_default_pass_2",
  "dice_wod20_default_pass_3",
  "dice_wod20_default_pass_4",
  "dice_wod20_default_pass_5",
  "dice_wod20_default_pass_6",
  "dice_wod20_default_pass_7",
  "dice_wod20_default_pass_8",
  "dice_wod20_default_pass_9",
  "logo_gold",
  "logo_red",
  "logo_teal",
  "misc_ankh_black",
  "misc_ankh_black-crit",
  "misc_ankh_misc_ankh_red",
  "misc_ankh_red-fangs",
  "misc_black-dot",
  "misc_butterfly",
  "misc_red-dot",
  "progress-bar_green_empty_left",
  "progress-bar_green_empty_middle",
  "progress-bar_green_empty_right",
  "progress-bar_green_filled_left",
  "progress-bar_green_filled_middle",
  "progress-bar_green_filled_right",
  "progress-bar_red_empty_left",
  "progress-bar_red_empty_middle",
  "progress-bar_red_empty_right",
  "progress-bar_red_filled_left",
  "progress-bar_red_filled_middle",
  "progress-bar_red_filled_right",
  "progress-bar_yellow_empty_left",
  "progress-bar_yellow_empty_middle",
  "progress-bar_yellow_empty_right",
  "progress-bar_yellow_filled_left",
  "progress-bar_yellow_filled_middle",
  "progress-bar_yellow_filled_right",
  "supporter_ancilla",
  "supporter_antediluvian",
  "supporter_elder",
  "supporter_fledgling",
  "supporter_methuselah",
  "supporter_mortal",
  "supporter_neonate",
  "tracker_dots_empty",
  "tracker_dots_maroon",
  "tracker_dots_purple",
  "tracker_dots_red",
  "tracker_dots_yellow",
  "tracker_health_tracker_0_box_empty",
  "tracker_health_tracker_20th_0_agg",
  "tracker_health_tracker_5th_0_agg",
  "tracker_health_tracker_5th_0_sup",
  "tracker_stain",
]);

/**
 * Union type of all available emoji asset names.
 * Each name corresponds to an image file in the emojis/ directory.
 *
 * @example
 * ```typescript
 * import type { EmojiName } from '@realm/assets';
 *
 * const emoji: EmojiName = 'dice_v5_default_primary_crit';
 * ```
 */
export type EmojiName = z.infer<typeof EmojiNameSchema>;

/**
 * Total count of available emojis
 */
export const EMOJI_COUNT = 109 as const;

/**
 * Strongly-typed emoji asset accessor.
 * Provides nested object access matching the folder structure.
 *
 * @example
 * ```typescript
 * import { Emojis } from '@realm/assets';
 *
 * // Access V5 dice
 * const critDie = Emojis.Dice.V5.Default.Primary.Crit;
 * // Returns: "dice_v5_default_primary_crit"
 *
 * // Access progress bar
 * const greenLeft = Emojis.ProgressBar.Green.Filled.Left;
 * // Returns: "progress_bar_green_filled_left"
 * ```
 */
export const Emojis = {
  Dice: {
    H5: {
      Default: {
        Primary: {
          Crit: "dice_h5_default_primary_crit",
          Fail: "dice_h5_default_primary_fail",
          Pass: "dice_h5_default_primary_pass",
        },
        Secondary: {
          Choice: "dice_h5_default_secondary_choice",
          Crit: "dice_h5_default_secondary_crit",
          Fail: "dice_h5_default_secondary_fail",
          Pass: "dice_h5_default_secondary_pass",
        },
      },
      Wod: {
        Primary: {
          Crit: "dice_h5_wod_primary_crit",
          Fail: "dice_h5_wod_primary_fail",
          Pass: "dice_h5_wod_primary_pass",
        },
        Secondary: {
          Choice: "dice_h5_wod_secondary_choice",
          Crit: "dice_h5_wod_secondary_crit",
          Fail: "dice_h5_wod_secondary_fail",
          Pass: "dice_h5_wod_secondary_pass",
        },
      },
    },
    V5: {
      Default: {
        Primary: {
          Crit: "dice_v5_default_primary_crit",
          Fail: "dice_v5_default_primary_fail",
          Pass: "dice_v5_default_primary_pass",
        },
        Secondary: {
          Bestial: "dice_v5_default_secondary_bestial",
          Crit: "dice_v5_default_secondary_crit",
          Fail: "dice_v5_default_secondary_fail",
          Pass: "dice_v5_default_secondary_pass",
        },
      },
      Wod: {
        Primary: {
          Crit: "dice_v5_wod_primary_crit",
          Fail: "dice_v5_wod_primary_fail",
          Pass: "dice_v5_wod_primary_pass",
        },
        Secondary: {
          Bestial: "dice_v5_wod_secondary_bestial",
          Crit: "dice_v5_wod_secondary_crit",
          Fail: "dice_v5_wod_secondary_fail",
          Pass: "dice_v5_wod_secondary_pass",
        },
      },
    },
    W5: {
      Default: {
        Primary: {
          Crit: "dice_w5_default_primary_crit",
          Fail: "dice_w5_default_primary_fail",
          Pass: "dice_w5_default_primary_pass",
        },
        Secondary: {
          Brutal: "dice_w5_default_secondary_brutal",
          Crit: "dice_w5_default_secondary_crit",
          Fail: "dice_w5_default_secondary_fail",
          Pass: "dice_w5_default_secondary_pass",
        },
      },
      Wod: {
        Primary: {
          Crit: "dice_w5_wod_primary_crit",
          Fail: "dice_w5_wod_primary_fail",
          Pass: "dice_w5_wod_primary_pass",
        },
        Secondary: {
          Brutal: "dice_w5_wod_secondary_brutal",
          Crit: "dice_w5_wod_secondary_crit",
          Fail: "dice_w5_wod_secondary_fail",
          Pass: "dice_w5_wod_secondary_pass",
        },
      },
    },
    Wod20: {
      Default: {
        Fail: {
          N1: "dice_wod20_default_fail_1",
          N10: "dice_wod20_default_fail_10",
          N2: "dice_wod20_default_fail_2",
          N3: "dice_wod20_default_fail_3",
          N4: "dice_wod20_default_fail_4",
          N5: "dice_wod20_default_fail_5",
          N6: "dice_wod20_default_fail_6",
          N7: "dice_wod20_default_fail_7",
          N8: "dice_wod20_default_fail_8",
          N9: "dice_wod20_default_fail_9",
          Botch: "dice_wod20_default_fail_botch",
        },
        Nightmare: "dice_wod20_default_nightmare",
        Pass: {
          N1: "dice_wod20_default_pass_1",
          N10: "dice_wod20_default_pass_10",
          N2: "dice_wod20_default_pass_2",
          N3: "dice_wod20_default_pass_3",
          N4: "dice_wod20_default_pass_4",
          N5: "dice_wod20_default_pass_5",
          N6: "dice_wod20_default_pass_6",
          N7: "dice_wod20_default_pass_7",
          N8: "dice_wod20_default_pass_8",
          N9: "dice_wod20_default_pass_9",
        },
      },
    },
  },
  Logo: {
    Gold: "logo_gold",
    Red: "logo_red",
    Teal: "logo_teal",
  },
  Misc: {
    Ankh: {
      Black: "misc_ankh_black",
      BlackCrit: "misc_ankh_black-crit",
      MiscAnkhRed: "misc_ankh_misc_ankh_red",
      RedFangs: "misc_ankh_red-fangs",
    },
    BlackDot: "misc_black-dot",
    Butterfly: "misc_butterfly",
    RedDot: "misc_red-dot",
  },
  ProgressBar: {
    Green: {
      Empty: {
        Left: "progress-bar_green_empty_left",
        Middle: "progress-bar_green_empty_middle",
        Right: "progress-bar_green_empty_right",
      },
      Filled: {
        Left: "progress-bar_green_filled_left",
        Middle: "progress-bar_green_filled_middle",
        Right: "progress-bar_green_filled_right",
      },
    },
    Red: {
      Empty: {
        Left: "progress-bar_red_empty_left",
        Middle: "progress-bar_red_empty_middle",
        Right: "progress-bar_red_empty_right",
      },
      Filled: {
        Left: "progress-bar_red_filled_left",
        Middle: "progress-bar_red_filled_middle",
        Right: "progress-bar_red_filled_right",
      },
    },
    Yellow: {
      Empty: {
        Left: "progress-bar_yellow_empty_left",
        Middle: "progress-bar_yellow_empty_middle",
        Right: "progress-bar_yellow_empty_right",
      },
      Filled: {
        Left: "progress-bar_yellow_filled_left",
        Middle: "progress-bar_yellow_filled_middle",
        Right: "progress-bar_yellow_filled_right",
      },
    },
  },
  Supporter: {
    Ancilla: "supporter_ancilla",
    Antediluvian: "supporter_antediluvian",
    Elder: "supporter_elder",
    Fledgling: "supporter_fledgling",
    Methuselah: "supporter_methuselah",
    Mortal: "supporter_mortal",
    Neonate: "supporter_neonate",
  },
  Tracker: {
    Dots: {
      Empty: "tracker_dots_empty",
      Maroon: "tracker_dots_maroon",
      Purple: "tracker_dots_purple",
      Red: "tracker_dots_red",
      Yellow: "tracker_dots_yellow",
    },
    Health: {
      Tracker0BoxEmpty: "tracker_health_tracker_0_box_empty",
      Tracker20th0Agg: "tracker_health_tracker_20th_0_agg",
      Tracker5th0Agg: "tracker_health_tracker_5th_0_agg",
      Tracker5th0Sup: "tracker_health_tracker_5th_0_sup",
    },
    Stain: "tracker_stain",
  },
} as const;

/**
 * Type of the Emojis constant
 */
export type EmojisType = typeof Emojis;

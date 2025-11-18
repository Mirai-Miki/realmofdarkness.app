import { Grid2 } from "@mui/material";
import { TextField } from "@mui/material";
import BloodPotency from "./BloodPotency";
import { useSheetContext } from "../../../routes/Character/Vampire5thSheet";
import Header from "../../Sheet/Header";

export default function BloodPotencyTab(props) {
  const { lock, sheet, handleUpdate } = useSheetContext();
  const potency = sheet.blood_potency;
  let bpInfo = bpChart[potency];

  return (
    <Grid2
      container
      spacing={2}
      size={{
        xs: 12,
        md: 8,
      }}
    >
      <Header>Blood Potency</Header>
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        paddingTop={2}
        size={12}
      >
        <BloodPotency
          lock={lock}
          potency={potency}
          handleUpdate={handleUpdate}
        />
      </Grid2>
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        paddingTop={2}
        size={12}
      >
        <Grid2>
          <TextField
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Blood Surge"
            variant="outlined"
            value={bpInfo.bloodSurge}
            fullWidth
            size="small"
          />
        </Grid2>
        <Grid2>
          <TextField
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Mend Amount"
            variant="outlined"
            value={bpInfo.damageMended}
            fullWidth
            size="small"
          />
        </Grid2>
        <Grid2>
          <TextField
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Power Bonus"
            variant="outlined"
            value={bpInfo.powerBonus}
            fullWidth
            size="small"
          />
        </Grid2>
        <Grid2>
          <TextField
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Rouse Re-Roll"
            variant="outlined"
            value={bpInfo.rouseCheck}
            fullWidth
            size="small"
          />
        </Grid2>
        <Grid2>
          <TextField
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Bane Severity"
            variant="outlined"
            value={bpInfo.bane}
            fullWidth
            size="small"
          />
        </Grid2>
        <Grid2>
          <TextField
            multiline
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
            label="Feeding Penalty"
            variant="outlined"
            value={bpInfo.feedingPenalty}
            fullWidth
            size="small"
            sx={{ marginRight: 4.375 }}
          />
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

const bpChart = {
  0: {
    bloodPotency: 0,
    bloodSurge: "Add 1 die",
    damageMended: "1 point of Superficial",
    powerBonus: "None",
    rouseCheck: "None",
    bane: 0,
    feedingPenalty: "No Effect",
  },

  1: {
    bloodPotency: 1,
    bloodSurge: "Add 2 dice",
    damageMended: "1 point of Superficial",
    powerBonus: "None",
    rouseCheck: "Level 1",
    bane: 2,
    feedingPenalty: "No Effect",
  },

  2: {
    bloodPotency: 2,
    bloodSurge: "Add 2 dice",
    damageMended: "2 points of Superficial",
    powerBonus: "Add 1 die",
    rouseCheck: "Level 1",
    bane: 2,
    feedingPenalty: "Animal and bagged blood slakes half Hunger",
  },

  3: {
    bloodPotency: 3,
    bloodSurge: "Add 3 dice",
    damageMended: "2 points of Superficial",
    powerBonus: "Add 1 die",
    rouseCheck: "Level 2 and below",
    bane: 3,
    feedingPenalty: "Animal and bagged blood slakes no Hunger",
  },

  4: {
    bloodPotency: 4,
    bloodSurge: "Add 3 dice",
    damageMended: "3 points of Superficial",
    powerBonus: "Add 2 dice",
    rouseCheck: "Level 2 and below",
    bane: 3,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 1 less Hunger per human",
  },

  5: {
    bloodPotency: 5,
    bloodSurge: "Add 4 dice",
    damageMended: "3 points of Superficial",
    powerBonus: "Add 2 dice",
    rouseCheck: "Level 3 and below",
    bane: 4,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 1 less Hunger per human. Must drain and kill a human to reduce Hunger below 2.",
  },

  6: {
    bloodPotency: 6,
    bloodSurge: "Add 4 dice",
    damageMended: "3 points of Superficial",
    powerBonus: "Add 3 dice",
    rouseCheck: "Level 3 and below",
    bane: 4,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 2 less Hunger per human. Must drain and kill a human to reduce Hunger below 2.",
  },

  7: {
    bloodPotency: 7,
    bloodSurge: "Add 5 dice",
    damageMended: "3 points of Superficial",
    powerBonus: "Add 3 dice",
    rouseCheck: "Level 4 and below",
    bane: 5,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 2 less Hunger per human. Must drain and kill a human to reduce Hunger below 2.",
  },

  8: {
    bloodPotency: 8,
    bloodSurge: "Add 5 dice",
    damageMended: "4 points of Superficial",
    powerBonus: "Add 4 dice",
    rouseCheck: "Level 4 and below",
    bane: 5,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 2 less Hunger per human. Must drain and kill a human to reduce Hunger below 3.",
  },

  9: {
    bloodPotency: 9,
    bloodSurge: "Add 6 dice",
    damageMended: "4 points of Superficial",
    powerBonus: "Add 4 dice",
    rouseCheck: "Level 5 and below",
    bane: 6,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 2 less Hunger per human. Must drain and kill a human to reduce Hunger below 3.",
  },

  10: {
    bloodPotency: 10,
    bloodSurge: "Add 6 dice",
    damageMended: "5 points of Superficial",
    powerBonus: "Add 5 dice",
    rouseCheck: "Level 5 and below",
    bane: 6,
    feedingPenalty:
      "Animal and bagged blood slakes no Hunger. Slake 3 less Hunger per human. Must drain and kill a human to reduce Hunger below 3.",
  },
};

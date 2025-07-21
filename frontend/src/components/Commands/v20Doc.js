import { List, ListItem, ListSubheader } from "@mui/material";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { Box } from "@mui/system";
import ListItemDialog from "../ListItemDialog";
import AccordionTitle from "./AccordionTitle";

const notesArg = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          Additional information to be displayed. This has no mechanical effect
          on the Roll or Tracker itself and is purely for documentation
          purposes.
        </Typography>
      </Box>
    }
  >
    notes: string
  </ListItemDialog>
);

const nameArg = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>The name of the Character.</Typography>
        <Typography sx={{ pt: 2 }}>
          Name is only case sensitive on creation, after case is not required. A
          name can be multiple words.
        </Typography>
      </Box>
    }
  >
    name: string
  </ListItemDialog>
);

const setHex = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          A hex code number in the form of '#000000' you can get these numbers
          using&nbsp;
          <a href="https://g.co/kgs/FwvgoG" target="_blank" rel="noreferrer">
            googles colour picker
          </a>
        </Typography>
        <Typography sx={{ pt: 2 }}>
          Changes the main colour linked to this character.
        </Typography>
        <Typography>[Mortal Supporter or higher]</Typography>
      </Box>
    }
  >
    colour: hex code
  </ListItemDialog>
);

const setImage = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          A URL link. The easiest way to get one is to upload your image to
          Discord then right click the image and select "Copy Link"
        </Typography>
        <Typography sx={{ pt: 2 }}>
          Changes the thumbnail image linked to this character. This is
          displayed using rolls when the character is linked or when displaying
          the tracked Character.
        </Typography>
        <Typography>[Mortal Supporter or higher]</Typography>
      </Box>
    }
  >
    image: url
  </ListItemDialog>
);

const setHealth = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 7 and 15</Typography>
        <Typography>
          The Total Health of your Character. Should only be changed in
          exceptional conditions.
        </Typography>
      </Box>
    }
  >
    health: number
  </ListItemDialog>
);

const setWillpower = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>The total Willpower a Character has.</Typography>
      </Box>
    }
  >
    willpower: number
  </ListItemDialog>
);

const setBlood = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 100</Typography>
        <Typography>
          The Total blood of this vampire. This value is dictated by a vampires
          Generation.
        </Typography>
        <Typography sx={{ pt: 2 }}>p121 VtM Corebook.</Typography>
      </Box>
    }
  >
    blood: number
  </ListItemDialog>
);

const setMortalBlood = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>
          The Current amount of blood in this Mortal. The total amount is always
          10.
        </Typography>
      </Box>
    }
  >
    blood: number
  </ListItemDialog>
);

const setVitae = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 5</Typography>
        <Typography>
          The Curent amount of Vitae this ghoul contains. Generally any amount
          over 1 is considered overdosing.
        </Typography>
        <Typography sx={{ pt: 2 }}>p502 VtM Corebook.</Typography>
      </Box>
    }
  >
    vitae: number
  </ListItemDialog>
);

const setMorality = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>
          The Total Humanity or Path value this Character has. This value is
          determind by a Characters Virtues. For Humanity this is their
          Conscience + Self Control
        </Typography>
        <Typography sx={{ pt: 2 }}>p119 VtM Corebook.</Typography>
      </Box>
    }
  >
    morality: number
  </ListItemDialog>
);

const setHumanity = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>
          The Total Humanity value this Character has. This value is determind
          by their Conscience + Self Control.
        </Typography>
        <Typography sx={{ pt: 2 }}>p119 VtM Corebook.</Typography>
      </Box>
    }
  >
    humanity: number
  </ListItemDialog>
);

const setMoralityName = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          Select the name of the Path your Character follows.
        </Typography>
        <Typography>
          Paths are an alternative to Humanity. They are found starting on page
          316 of the VtM corebook.
        </Typography>
      </Box>
    }
  >
    morality_name: option
  </ListItemDialog>
);

const setExp = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 1000</Typography>
        <Typography>
          The total Experiance a Character has. Page 122 VtM Corebook
        </Typography>
      </Box>
    }
  >
    exp: number
  </ListItemDialog>
);

const setBashing = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Bashing damage this character has. Eg. setting
          this value to 2 will give your character 2 bashing damage.
        </Typography>
      </Box>
    }
  >
    bashing_damage: number
  </ListItemDialog>
);

const setLethal = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Lethal damage this character has. Eg. setting this
          value to 2 will give your character 2 Lethal damage.
        </Typography>
      </Box>
    }
  >
    lethal_damage: number
  </ListItemDialog>
);

const setAgg = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Aggravated damage this character has. Eg. setting
          this value to 2 will give your character 2 Aggravated damage.
        </Typography>
      </Box>
    }
  >
    agg_damage: number
  </ListItemDialog>
);

const setNameChange = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>The name to change to</Typography>
        <Typography>
          This name is case sensitive. Multiple words are allowed.
        </Typography>
      </Box>
    }
  >
    change_name: string
  </ListItemDialog>
);

const setRage = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>The total Rage pool for this Werewolf.</Typography>
        <Typography sx={{ pt: 2 }}>p144 WtA Corebook.</Typography>
      </Box>
    }
  >
    rage: number
  </ListItemDialog>
);

const setGnosis = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>The total Gnosis pool for this Werewolf.</Typography>
        <Typography sx={{ pt: 2 }}>p146 WtA Corebook.</Typography>
      </Box>
    }
  >
    gnosis: number
  </ListItemDialog>
);

const setArete = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>The total Arete pool for this Mage.</Typography>
        <Typography sx={{ pt: 2 }}>p328 MtA Corebook.</Typography>
      </Box>
    }
  >
    arete: number
  </ListItemDialog>
);

const setQuintessence = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 20</Typography>
        <Typography>
          The Current Quintessence for this Mage. Will not be higher then
          Paradox.
        </Typography>
        <Typography sx={{ pt: 2 }}>p331 MtA Corebook.</Typography>
      </Box>
    }
  >
    quintessence: number
  </ListItemDialog>
);

const setParadox = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 20</Typography>
        <Typography>The Current Paradox for this Mage.</Typography>
        <Typography sx={{ pt: 2 }}>p331 MtA Corebook.</Typography>
      </Box>
    }
  >
    paradox: number
  </ListItemDialog>
);

const setCorpus = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>The total Corpus for this Wraith.</Typography>
        <Typography sx={{ pt: 2 }}>p291 WtO Corebook.</Typography>
      </Box>
    }
  >
    corpus: number
  </ListItemDialog>
);

const setPathos = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>The total Pathos for this Wraith.</Typography>
        <Typography sx={{ pt: 2 }}>p114 WtO Corebook.</Typography>
      </Box>
    }
  >
    pathos: number
  </ListItemDialog>
);

const setFaith = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>The total Faith for this Demon.</Typography>
        <Typography sx={{ pt: 2 }}>p249 DtF Corebook.</Typography>
      </Box>
    }
  >
    faith: number
  </ListItemDialog>
);

const setTorment = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>Your Permanent Torment Rating.</Typography>
        <Typography sx={{ pt: 2 }}>p160 DtF Corebook.</Typography>
      </Box>
    }
  >
    torment: number
  </ListItemDialog>
);

const setGlamour = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>Your total Glamour Rating.</Typography>
        <Typography sx={{ pt: 2 }}>p259 CtD Corebook.</Typography>
      </Box>
    }
  >
    glamour: number
  </ListItemDialog>
);

const setBanality = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 1 and 10</Typography>
        <Typography>Your total Banality Rating.</Typography>
        <Typography sx={{ pt: 2 }}>p259 CtD Corebook.</Typography>
      </Box>
    }
  >
    banality: number
  </ListItemDialog>
);

const setNightmare = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>Your total Nightmare Rating.</Typography>
        <Typography sx={{ pt: 2 }}>p274 CtD Corebook.</Typography>
      </Box>
    }
  >
    nightmare: number
  </ListItemDialog>
);

const setImbalance = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 10</Typography>
        <Typography>Your total Imbalance Rating.</Typography>
        <Typography sx={{ pt: 2 }}>p275 CtD Corebook.</Typography>
      </Box>
    }
  >
    imbalance: number
  </ListItemDialog>
);

const setHealthChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 7 and 15</Typography>
        <Typography>
          The Total Chimerical Health of your Character. Should only be changed
          in exceptional conditions.
        </Typography>
      </Box>
    }
  >
    health_chimerical: number
  </ListItemDialog>
);

const setBashingChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Bashing damage this character has. Eg. setting
          this value to 2 will give your character 2 bashing damage.
        </Typography>
      </Box>
    }
  >
    bashing_chimerical: number
  </ListItemDialog>
);

const setLethalChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Lethal damage this character has. Eg. setting this
          value to 2 will give your character 2 Lethal damage.
        </Typography>
      </Box>
    }
  >
    lethal_chimerical: number
  </ListItemDialog>
);

const setAggChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between 0 and 15</Typography>
        <Typography>
          The total amount of Aggravated damage this character has. Eg. setting
          this value to 2 will give your character 2 Aggravated damage.
        </Typography>
      </Box>
    }
  >
    agg_chimerical: number
  </ListItemDialog>
);

const updateExp = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -3000 and 3000</Typography>
        <Typography>
          Updates your Current experiance by the amount. Positive numbers will
          also increase your total Experiance, while negative numbers will only
          reduce your current experiance.
        </Typography>
      </Box>
    }
  >
    exp: number
  </ListItemDialog>
);

const updateWillpower = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount specified to your total Willpower. This
          does not add or remove damage.
        </Typography>
        <Typography>Page 157 VtM Corebook</Typography>
      </Box>
    }
  >
    willpower: number
  </ListItemDialog>
);

const updateHealth = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount specified to your total Health. This
          does not add or remove damage.
        </Typography>
      </Box>
    }
  >
    health: number
  </ListItemDialog>
);

const updateBashing = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of bashing damage specified. Eg. A value
          of -2 will remove 2 bashing damage
        </Typography>
      </Box>
    }
  >
    bashing_damage: number
  </ListItemDialog>
);

const updateLethal = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of Lethal damage specified. Eg. A value
          of -2 will remove 2 Lethal damage.
        </Typography>
      </Box>
    }
  >
    lethal_damage: number
  </ListItemDialog>
);

const updateAgg = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of Aggravated damage specified. Eg. A
          value of -2 will remove 2 Aggravated damage
        </Typography>
      </Box>
    }
  >
    agg_damage: number
  </ListItemDialog>
);

const updatePlayer = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>@mention the user this character belongs to.</Typography>
        <Typography sx={{ pt: 2 }}>
          This is for Storytellers who need to update another players Character.
        </Typography>
        <Typography>[ST only]</Typography>
      </Box>
    }
  >
    player: @mention
  </ListItemDialog>
);

const updateBlood = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -200 and 200</Typography>
        <Typography>
          Will add or remove the amount of Blood specified from the pool. Eg. A
          value of -2 will remove 2 blood.
        </Typography>
      </Box>
    }
  >
    blood: number
  </ListItemDialog>
);

const updateMortalBlood = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Blood specified from the pool. Eg. A
          value of -2 will remove 2 blood.
        </Typography>
      </Box>
    }
  >
    blood: number
  </ListItemDialog>
);

const updateVitae = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -10 and 10</Typography>
        <Typography>
          Will add or remove the amount of Vitae specified from the pool. Eg. A
          value of -2 will remove 2 Vitae.
        </Typography>
      </Box>
    }
  >
    blood: number
  </ListItemDialog>
);

const updateMorality = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Morality specified from the total.
          Eg. A value of -2 will remove 2 Morality.
        </Typography>
      </Box>
    }
  >
    morality: number
  </ListItemDialog>
);

const updateHumanity = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Humanity specified from the total.
          Eg. A value of -2 will remove 2 Humanity.
        </Typography>
      </Box>
    }
  >
    humanity: number
  </ListItemDialog>
);

const updateRage = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Rage specified from the total. Eg. A
          value of -2 will remove 2 Rage. Current Rage can also exceed the total
          pool.
        </Typography>
      </Box>
    }
  >
    rage: number
  </ListItemDialog>
);

const updateGnosis = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Gnosis specified from the total. Eg.
          A value of -2 will remove 2 Gnosis.
        </Typography>
      </Box>
    }
  >
    gnosis: number
  </ListItemDialog>
);

const updateArete = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Arete specified from the total. Eg. A
          value of -2 will remove 2 Arete.
        </Typography>
      </Box>
    }
  >
    arete: number
  </ListItemDialog>
);

const updateQuintessence = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -30 and 30</Typography>
        <Typography>
          Will add or remove the amount of Quintessence specified. Eg. A value
          of -2 will remove 2 Quintessence. Quintessence will never be be capped
          by the Paradox rating.
        </Typography>
      </Box>
    }
  >
    quintessence: number
  </ListItemDialog>
);

const updateParadox = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -30 and 30</Typography>
        <Typography>
          Will add or remove the amount of Paradox specified. Eg. A value of -2
          will remove 2 Paradox.
        </Typography>
      </Box>
    }
  >
    paradox: number
  </ListItemDialog>
);

const updateCorpus = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Coprus specified. Eg. A value of -2
          will remove 2 Corpus.
        </Typography>
      </Box>
    }
  >
    corpus: number
  </ListItemDialog>
);

const updatePathos = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount of Pathos specified. Eg. A value of -2
          will remove 2 Pathos.
        </Typography>
      </Box>
    }
  >
    pathos: number
  </ListItemDialog>
);

const updateFatih = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Faith specified. Eg. A value of -2
          will remove 2 Faith.
        </Typography>
      </Box>
    }
  >
    faith: number
  </ListItemDialog>
);

const updateTorment = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Torment specified. Eg. A value of -2
          will remove 2 Torment.
        </Typography>
      </Box>
    }
  >
    torment: number
  </ListItemDialog>
);

const updateGlamour = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Glamour specified. Eg. A value of -2
          will remove 2 Glamour.
        </Typography>
      </Box>
    }
  >
    glamour: number
  </ListItemDialog>
);

const updateBanality = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Banality specified. Eg. A value of -2
          will remove 2 Banality.
        </Typography>
      </Box>
    }
  >
    banality: number
  </ListItemDialog>
);

const updateNightmare = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Nightmare specified. Eg. A value of
          -2 will remove 2 Nightmare.
        </Typography>
      </Box>
    }
  >
    nightmare: number
  </ListItemDialog>
);

const updateImbalance = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -15 and 15</Typography>
        <Typography>
          Will add or remove the amount of Imbalance specified. Eg. A value of
          -2 will remove 2 Imbalance.
        </Typography>
      </Box>
    }
  >
    imbalance: number
  </ListItemDialog>
);

const updateHealthChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -20 and 20</Typography>
        <Typography>
          Will add or remove the amount specified to your total Health. This
          does not add or remove damage.
        </Typography>
      </Box>
    }
  >
    health_chimerical: number
  </ListItemDialog>
);

const updateBashingChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of bashing damage specified. Eg. A value
          of -2 will remove 2 bashing damage
        </Typography>
      </Box>
    }
  >
    bashing_chimerical: number
  </ListItemDialog>
);

const updateLethalChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of Lethal damage specified. Eg. A value
          of -2 will remove 2 Lethal damage.
        </Typography>
      </Box>
    }
  >
    lethal_chimerical: number
  </ListItemDialog>
);

const updateAggChimerical = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A Number between -50 and 50</Typography>
        <Typography>
          Will add or remove the amount of Aggravated damage specified. Eg. A
          value of -2 will remove 2 Aggravated damage
        </Typography>
      </Box>
    }
  >
    agg_chimerical: number
  </ListItemDialog>
);

const Dice20thDoc = [
  {
    // Dice Roll
    summery: <AccordionTitle>Dice Roll</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/dice roll</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 1 and 50.</Typography>
              <Typography sx={{ pt: 2 }}>
                The base pool you will be rolling with.
              </Typography>
              <Typography sx={{ pt: 2 }}>p247 VtM corebook</Typography>
            </Box>
          }
        >
          pool: number
        </ListItemDialog>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 2 and 10.</Typography>
              <Typography sx={{ pt: 2 }}>
                The difficulty of the roll. This sets the number a dice will
                need to meet or exceed to be considered a success.
              </Typography>
              <Typography sx={{ pt: 2 }}>p249 VtM Corebook.</Typography>
            </Box>
          }
        >
          difficulty: number
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Select True of False.</Typography>
              <Typography sx={{ pt: 2 }}>
                Selecting True will add one automatic success to your roll. If
                you have added a tracked character in the character option this
                will also automatically -1 willpower from your character.
              </Typography>
              <Typography sx={{ pt: 2 }}>p250 VtM Corebook.</Typography>
            </Box>
          }
        >
          willpower: True/False
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between -20 and 20.</Typography>
              <Typography sx={{ pt: 2 }}>
                Adds a number of automatic successes to this roll. If a negative
                number is used it will take away a number of successes.
              </Typography>
              <Typography sx={{ pt: 2 }}>p250 VtM Corebook.</Typography>
            </Box>
          }
        >
          modifier: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>The name of the speciality being used.</Typography>
              <Typography sx={{ pt: 2 }}>
                Using this option will make any 10s rolled count as two
                successes instead of the normal 1. It will also print the name
                of the Speciality for those to see.
              </Typography>
              <Typography sx={{ pt: 2 }}>p96 VtM Corebook.</Typography>
            </Box>
          }
        >
          speciality: string
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>The name of the speciality you are using.</Typography>
              <Typography sx={{ pt: 2 }}>
                This will automatically add +1 die to your pool.
              </Typography>
              <Typography sx={{ pt: 2 }}>p159 VtM Corebook.</Typography>
            </Box>
          }
        >
          speciality: string
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 1 and 50.</Typography>
              <Typography sx={{ pt: 2 }}>
                Replaces x number of dice in your pool with Nightmare dice.
                Rolling a 10 on a on a Nightmare dice will increase a players
                Nightmare by 1.
              </Typography>
              <Typography sx={{ pt: 2 }}>p274 CtD Corebook.</Typography>
            </Box>
          }
        >
          nightmare: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                The Name of the Character making the roll.
              </Typography>
              <Typography sx={{ pt: 2 }}>
                If you have a tracked character with the same name, this option
                will link the roll to that character. This means if you use the
                willpower option in this roll your tracked character will
                automatically lose a willpower.
              </Typography>
            </Box>
          }
        >
          character: string
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>True or False option.</Typography>
              <Typography sx={{ pt: 2 }}>
                Selecting True, will stop any 1s rolled from subtracting a
                success from your total and ensuring no botch outcome takes
                place.
              </Typography>
            </Box>
          }
        >
          no_botch: True/False
        </ListItemDialog>
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Typography>
            Makes a dice roll following the standard 20th edition ruleset.
          </Typography>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Initiative Roll</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/dice initiative</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 0 and 50.</Typography>
              <Typography sx={{ pt: 2 }}>
                Your Dexterity + Wits. This will be added to a 1d10 dice roll to
                determine your total Initiative rating.
              </Typography>
              <Typography sx={{ pt: 2 }}>
                For a more advanced Initative Tracker see the Initative Tracker
                Commands.
              </Typography>
              <Typography sx={{ pt: 2 }}>p271 VtM corebook</Typography>
            </Box>
          }
        >
          dexterity_wits: number
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                The Name of the Character making the roll.
              </Typography>
              <Typography sx={{ pt: 2 }}>
                This will just print the value on the roll output.
              </Typography>
            </Box>
          }
        >
          character: string
        </ListItemDialog>
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Typography>
            Initiative roll using a Characters Dexterity + Wits
          </Typography>
        </ListItem>
      </List>
    ),
  },
  {
    // General Dice Roll
    summery: <AccordionTitle>General Dice Roll</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/dice general</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                A dice set is a string in the form of "(x)d(Y)" where (x) is the
                number of dice to be rolled and (y) is the number of sides each
                dice has.
              </Typography>
              <Typography sx={{ pt: 2 }}>
                Eg. if we want to roll six, 10sided dice we would type "6d10" in
                the argument field without the quotes.
              </Typography>
            </Box>
          }
        >
          dice_set_01: string
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                Adds or Removes the number entered from the total of the roll.
              </Typography>
            </Box>
          }
        >
          modifier: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                A dice set is a string in the form of "(x)d(Y)" where (x) is the
                number of dice to be rolled and (y) is the number of sides each
                dice has.
              </Typography>
              <Typography sx={{ pt: 2 }}>
                Eg. if we want to roll six, 10sided dice we would type "6d10" in
                the argument field without the quotes.
              </Typography>
            </Box>
          }
        >
          dice_set_XX: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>
                The total amount the dice should equal for the roll to pass.
              </Typography>
            </Box>
          }
        >
          difficulty: number
        </ListItemDialog>
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Rolls a number of dice sets that are specified by you.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
];

const Tracker20thDoc = [
  {
    // Lookup Character
    summery: <AccordionTitle>Lookup Character</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/character find</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Typography>
              Displays the change history for each update made, including notes.
            </Typography>
          }
        >
          history: option
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>@mention the user to lookup</Typography>
              <Typography sx={{ pt: 2 }}>
                This command can only be used by a Storyteller or Administrator.
                If you are trying to find your own characters, do not use this
                argument.
              </Typography>
            </Box>
          }
        >
          player: @user
        </ListItemDialog>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Returns a list of your characters and allows you to see their
              stats.
            </Typography>
            <Typography>
              If used in DMs with the bot it will return every character from
              all servers you have. If used in a server it will only return a
              list of characters you have from that server.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              Storytellers may use the 'player' argument to lookup other players
              characters on their servers.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Delete Character
    summery: <AccordionTitle>Delete Character</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/character delete</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>@mention the user to lookup</Typography>
              <Typography sx={{ pt: 2 }}>
                This command can only be used by a Storyteller or Administrator.
                If you are trying to find your own characters, do not use this
                argument.
              </Typography>
            </Box>
          }
        >
          player: @user
        </ListItemDialog>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Allows you to delete one or more of your Characters from a list.
            </Typography>
            <Typography>
              If used in DMs with the bot you will see a list of every Character
              you have. If used in a server you will only see a list of
              characters from that server.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              Storytellers may use the 'player' argument to delete other
              characters from their server. Note: this won't actually delete
              their character but merely disconnect it from your server.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Delete Character
    summery: <AccordionTitle>Default Character</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/character default</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Name of the character to link</Typography>
              <Typography sx={{ pt: 2 }}>
                A character must have already been made in the tracker.
              </Typography>
            </Box>
          }
        >
          name: string
        </ListItemDialog>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Turns off the default character if used.</Typography>
            </Box>
          }
        >
          disable: True/False
        </ListItemDialog>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>Links a character as your server default.</Typography>
            <Typography>
              This will be used for all dice rolls where the `character` option
              is not used. It will automatically add your default character. You
              can override this by specifing another character using the
              `character` option on dice rolls. Or you can disable this
              functionality by using the `disable` option if you do not like it.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              Requires [Mortal Supporter] status or greater to use.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // New Vampire Tracker
    summery: <AccordionTitle>New Vampire Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/vampire new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setBlood}
        <Divider component="li" />
        {setMorality}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setMoralityName}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Vampire Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Update Vampire Tracker
    summery: <AccordionTitle>Update Vampire Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/vampire update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateBlood}
        <Divider component="li" />
        {updateMorality}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Set Vampire Tracker
    summery: <AccordionTitle>Set Vampire Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/vampire set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setBlood}
        <Divider component="li" />
        {setMorality}
        <Divider component="li" />
        {setMoralityName}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // New Werwolf Tracker
    summery: <AccordionTitle>New Werewolf Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/werewolf new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setRage}
        <Divider component="li" />
        {setGnosis}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Werewolf Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Update Werewolf Tracker
    summery: <AccordionTitle>Update Werewolf Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/werewolf update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateRage}
        <Divider component="li" />
        {updateGnosis}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Set Werwolf Tracker
    summery: <AccordionTitle>Set Werewolf Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/werewolf set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setRage}
        <Divider component="li" />
        {setGnosis}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // New Changeling Tracker
    summery: <AccordionTitle>New Changeling Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/changeling_new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setGlamour}
        <Divider component="li" />
        {setBanality}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setNightmare}
        <Divider component="li" />
        {setImbalance}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {setHealthChimerical}
        <Divider component="li" />
        {setBashingChimerical}
        <Divider component="li" />
        {setLethalChimerical}
        <Divider component="li" />
        {setAggChimerical}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Changeling Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Update Werewolf Tracker
    summery: <AccordionTitle>Update Changeling Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/changeling_update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateGlamour}
        <Divider component="li" />
        {updateBanality}
        <Divider component="li" />
        {updateNightmare}
        <Divider component="li" />
        {updateImbalance}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updateHealthChimerical}
        <Divider component="li" />
        {updateBashingChimerical}
        <Divider component="li" />
        {updateLethalChimerical}
        <Divider component="li" />
        {updateAggChimerical}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Changeling Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/changeling_set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setGlamour}
        <Divider component="li" />
        {setBanality}
        <Divider component="li" />
        {setNightmare}
        <Divider component="li" />
        {setImbalance}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {setHealthChimerical}
        <Divider component="li" />
        {setBashingChimerical}
        <Divider component="li" />
        {setLethalChimerical}
        <Divider component="li" />
        {setAggChimerical}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>New Mage Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/mage new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setArete}
        <Divider component="li" />
        {setQuintessence}
        <Divider component="li" />
        {setParadox}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Mage Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Update Mage Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/mage update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateArete}
        <Divider component="li" />
        {updateQuintessence}
        <Divider component="li" />
        {updateParadox}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Mage Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/mage set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setArete}
        <Divider component="li" />
        {setQuintessence}
        <Divider component="li" />
        {setParadox}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>New Wraith Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/wraith new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setCorpus}
        <Divider component="li" />
        {setPathos}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Wraith Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Update Wraith Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/wraith update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateCorpus}
        <Divider component="li" />
        {updatePathos}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Wraith Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/wraith set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setCorpus}
        <Divider component="li" />
        {setPathos}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>New Demon Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/demon new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setFaith}
        <Divider component="li" />
        {setTorment}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Demon Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Update Demon Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/demon update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateFatih}
        <Divider component="li" />
        {updateTorment}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Demon Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/demon set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setFaith}
        <Divider component="li" />
        {setTorment}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>New Ghoul Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/ghoul new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setHumanity}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setMortalBlood}
        <Divider component="li" />
        {setVitae}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Ghoul Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Update Ghoul Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/ghoul update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateHumanity}
        <Divider component="li" />
        {updateMortalBlood}
        <Divider component="li" />
        {updateVitae}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Ghoul Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/ghoul set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setHumanity}
        <Divider component="li" />
        {setMortalBlood}
        <Divider component="li" />
        {setVitae}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>New Human Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/human new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <Divider component="li" />
        {setWillpower}
        <Divider component="li" />
        {setHumanity}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setMortalBlood}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Creates a new Human Character tracker for you with the given
              values.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Update Human Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/human update</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {updateWillpower}
        <Divider component="li" />
        {updateHumanity}
        <Divider component="li" />
        {updateMortalBlood}
        <Divider component="li" />
        {updateExp}
        <Divider component="li" />
        {updateHealth}
        <Divider component="li" />
        {updateBashing}
        <Divider component="li" />
        {updateLethal}
        <Divider component="li" />
        {updateAgg}
        <Divider component="li" />
        {updatePlayer}
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Updates your Character stats using plus or minus values.
            </Typography>
            <Typography>
              Eg. typing the value of 2 in the willpower argument will increase
              Willpower by 2 while typing the value -3 will reduce Willpower by
              three.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Set Human Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/human set</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {nameArg}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {setWillpower}
        <Divider component="li" />
        {setHumanity}
        <Divider component="li" />
        {setMortalBlood}
        <Divider component="li" />
        {setExp}
        <Divider component="li" />
        {setHealth}
        <Divider component="li" />
        {setBashing}
        <Divider component="li" />
        {setLethal}
        <Divider component="li" />
        {setAgg}
        <Divider component="li" />
        {notesArg}
        <Divider component="li" />
        {setNameChange}
        <Divider component="li" />
        {setHex}
        <Divider component="li" />
        {setImage}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Sets your Character stats using Absolute values.
            </Typography>
            <Typography>
              Eg. typing the value of 3 in the willpower argument will set total
              Willpower to three regardless of what it was before.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
];

export { Dice20thDoc, Tracker20thDoc };

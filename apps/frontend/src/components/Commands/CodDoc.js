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
          on the roll itself and is purely for documentation purposes.
        </Typography>
      </Box>
    }
  >
    notes: string
  </ListItemDialog>
);

const DiceCodDoc = [
  {
    // CoD Roll
    summery: <AccordionTitle>Chronicles of Darkness Roll</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/dice roll</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 1 and 30.</Typography>
              <Typography sx={{ pt: 2 }}>
                The base pool you will be rolling with, can be modified by other
                arguments, such as "bonus" or "penalty".
              </Typography>
              <Typography sx={{ pt: 2 }}>p69 CoD corebook.</Typography>
            </Box>
          }
        >
          pool: number
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 1 and 30. Defaults to 0.</Typography>
              <Typography sx={{ pt: 2 }}>
                Adds a number of bonus dice to the total pool.
              </Typography>
            </Box>
          }
        >
          bonus: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 1 and 50. Defaults to 1.</Typography>
              <Typography sx={{ pt: 2 }}>
                Removes a number of dice from the total pool. If there are no
                dice remaining in the pool then a chance Dice will be rolled
                instead.
              </Typography>
            </Box>
          }
        >
          penalty: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Name of the speciality being used.</Typography>
              <Typography sx={{ pt: 2 }}>
                This adds +1 dice to the total pool.
              </Typography>
            </Box>
          }
        >
          speciality: string
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Select either "true" or "false"</Typography>
              <Typography sx={{ pt: 2 }}>
                If "true", this will add +3 dice to the total pool.
              </Typography>
              <Typography sx={{ pt: 2 }}>p73 CoD Corebook.</Typography>
            </Box>
          }
        >
          willpower: option
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>Select either "true" or "false"</Typography>
              <Typography sx={{ pt: 2 }}>
                If "true", this will reroll each failed dice once.
              </Typography>
              <Typography sx={{ pt: 2 }}>p72 CoD Corebook.</Typography>
            </Box>
          }
        >
          rote: option
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 2 and 10. Defaults to 8</Typography>
              <Typography sx={{ pt: 2 }}>
                The target number needed for a dice to be considered a Succcess.
              </Typography>
            </Box>
          }
        >
          target: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>A number between 8 and 11. Defaults to 10</Typography>
              <Typography sx={{ pt: 2 }}>
                The lowest number needed to trigger a reroll dice to occur.
                Selecting 11 will disable rerolls for this roll.
              </Typography>
            </Box>
          }
        >
          reroll: number
        </ListItemDialog>
        <Divider component="li" />
        <ListItemDialog
          dialogContent={
            <Typography>
              The name of the Character that made the roll.
            </Typography>
          }
        >
          character: string
        </ListItemDialog>
        <Divider component="li" />
        {notesArg}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Typography>
            Makes a dice roll following the standard Vampire: the Masquerade v5
            rules.
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

export { DiceCodDoc };

import { List, ListItem, ListSubheader } from "@mui/material";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { Box } from "@mui/system";
import ListItemDialog from "../ListItemDialog";
import AccordionTitle from "./AccordionTitle";

const name = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          The name of the Character rolling. Names are unique for each discord
          user. So if you are rolling with two characters with the same name you
          will need to change them slightly.
        </Typography>
        <Typography sx={{ pt: 2 }}>
          A name is only case sensitive the first time you use it. After that
          any case will register as the same character.
        </Typography>
      </Box>
    }
  >
    name: string
  </ListItemDialog>
);

const action = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>
          The action you are taking for this round. This can be a few sentances
          if needed.
        </Typography>
      </Box>
    }
  >
    action: string
  </ListItemDialog>
);

const dexWits = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A number between 1 and 100.</Typography>
        <Typography sx={{ pt: 2 }}>
          This is your characters Dexterity + Wits. It will be added to any
          modifier and a 1d10 to determine your Initiative score.
        </Typography>
      </Box>
    }
  >
    dex_wits: number
  </ListItemDialog>
);

const modifier = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A number between -50 and 50.</Typography>
        <Typography sx={{ pt: 2 }}>
          This will add or subtract from your Initiative score. If your modifier
          brings your score below 0, you Initiative will be set to 0.
        </Typography>
      </Box>
    }
  >
    modifier: number
  </ListItemDialog>
);

const extraActions = (
  <ListItemDialog
    dialogContent={
      <Box>
        <Typography>A number between 1 and 5.</Typography>
        <Typography sx={{ pt: 2 }}>
          Adding this options will give you extra actions during the Declare
          Actions phase of the Initiative. Your extra actions will be last in
          order. If someone else also uses Extra Actions then Initiative order
          will be used to determine which extra actions go first.
        </Typography>
      </Box>
    }
  >
    extra_actions: number
  </ListItemDialog>
);

const Init20thDoc = [
  {
    summery: <AccordionTitle>New Initiative Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init new</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Starts a new Initative Tracker for 20th Edition
            </Typography>
            <Typography sx={{ pt: 2 }}>
              In the first phase players will be required to join the round by
              using the command /init roll and filling in the details. Once all
              characters are ready click on the "Reveal Initative" Button.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              Only one Tracker can be active in a channel at any time. Once you
              are done with the tracker you can end it using the "End
              Initiative" Button or by using this Command and confirming you
              wish to end the old Tracker.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Roll for Initiative</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init roll</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {name}
        <Divider component="li" />
        {dexWits}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {modifier}
        <Divider component="li" />
        {extraActions}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Use this command during the Roll phase of the tracker. The tracker
              will tell you when it is ok to use this command.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              If you make a mistake in your roll, you can use this command again
              to correct the mistake as long as the Initiative has not been
              revealed yet. Make sure you use the same name for this to work.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Rejoin a new round</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init join</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {name}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {extraActions}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Use this command during the Join phase of the tracker. The tracker
              will tell you when it is ok to use this command.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This command can only be used if you have rolled in a previous
              round during this combat. And only if the person overseeing the
              combat has elected to reuse the Initiative order.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Reroll for a new round</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init reroll</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {name}
        <ListSubheader>Optional Arguments:</ListSubheader>
        {modifier}
        <Divider component="li" />
        {extraActions}
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Use this command during the Roll phase of the tracker. Noted by
              the Tracker stating you may "Roll for Initiative!".
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This command can only be used if you have rolled in a previous
              round during this combat. And only if you are rolling for a new
              initiative order.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This command will retain your Dex + Wits and modifier from the
              previous roll. You can optionally change the modifier if needed.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Declare an Action</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init declare</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        {action}
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Use this command during the Declare phase of the tracker when the
              bot pings you and tells you it is your turn.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This command can only be used on your turn to Declare.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    summery: <AccordionTitle>Repost the Tracker</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/init repost</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              Using this command will delete the old tracker post (if it exists)
              and repost it again as it was.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This can be useful if the tracker has been buried under a lot of
              other messages.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
];

export { Init20thDoc };

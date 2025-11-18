import { List, ListItem, ListSubheader } from "@mui/material";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import ListItemDialog from "../ListItemDialog";
import AccordionTitle from "./AccordionTitle";

const Server20thDoc = [
  {
    // Set Tracker Channel
    summery: <AccordionTitle>Set Tracker Channel</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/server tracker</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Typography>#mention the Channel to be used.</Typography>
          }
        >
          channel: #channel
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>
              You must be a server "Administrator" or have a role that has been
              added as a Storyteller role using the '/tracker storytellers'
              command, to use this command.
            </Typography>
            <Typography sx={{ pt: 2 }}>
              This sets a channel to display live character updates to so
              Storytellers can see any character updates as they happen. It is
              highly recommended to make this channel private to prevent
              Metagaming
            </Typography>
            <Typography sx={{ pt: 2 }}>
              The bot will require "View Channel", "Send Messages" and "Embed
              Links" in this channel to function.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
  {
    // Set Tracker Storyteller Roles
    summery: <AccordionTitle>Set Storyteller Roles</AccordionTitle>,
    details: (
      <List>
        <ListSubheader>Command</ListSubheader>
        <ListItem>/server storytellers</ListItem>
        <ListSubheader>Required Arguments:</ListSubheader>
        <ListItemDialog
          dialogContent={
            <Box>
              <Typography>@mention the role to be added</Typography>
            </Box>
          }
        >
          role: @role
        </ListItemDialog>
        <ListSubheader>Optional Arguments:</ListSubheader>
        <ListItem>None</ListItem>
        <ListSubheader>Description</ListSubheader>
        <ListItem>
          <Box>
            <Typography>Requires "Administrator" permission to use.</Typography>
            <Typography>
              Lets the bot know which roles in the server are "Storyteller"
              roles.
            </Typography>
            <Typography>
              By default only users with "Administrator" permissions can lookup
              and delete other players characters. Any role added using this
              command will also be granted those privileges.
            </Typography>
          </Box>
        </ListItem>
      </List>
    ),
  },
];

export { Server20thDoc };

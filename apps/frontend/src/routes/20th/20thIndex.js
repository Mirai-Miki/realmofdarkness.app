import { Container, Grid2, Typography } from "@mui/material";
import { Button, Box, ImageList, ImageListItem } from "@mui/material";
import { Link } from "react-router-dom";
import { Paper } from "@mui/material";

export default function TwentiethIndex() {
  return (
    <Grid2
      container
      spacing={4}
      direction="row"
      justifyContent="space-evenly"
      alignItems="center"
    >
      <Grid2
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <Button
          color="primary"
          variant="outlined"
          size="large"
          href="https://discord.com/oauth2/authorize?client_id=898894443757838418&scope=bot%20applications.commands&permissions=278528"
          target="_blank"
          sx={{ width: "100%", height: 60 }}
        >
          Bot Invite Link
        </Button>
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <Button
          color="primary"
          variant="outlined"
          component={Link}
          to="commands/"
          size="large"
          sx={{ width: "100%", height: 60 }}
        >
          Bot Command Docs
        </Button>
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <Button
          color="primary"
          variant="outlined"
          size="large"
          disabled
          sx={{ width: "100%", height: 60 }}
        >
          Dice (Coming soon!)
        </Button>
      </Grid2>
      <Grid2 size={12}>
        <Paper elevation={3}>
          <Container disableGutters sx={{ py: 5, px: 5 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ pb: 2, textAlign: "center" }}
              color="primary"
            >
              20th Anniversary Edition
            </Typography>
            <Typography sx={{ pb: 2 }}>
              The Realm of Darkness 20th edition bot contains a dice roller,
              Character tracker, Initiative tracker and new features are being
              added all the time.
            </Typography>
            <Typography variant="h4" component="h2" color="primary">
              20th Dice Roller
            </Typography>
            <Typography component="div">
              <ul>
                <li>
                  Supports Botching and Botch dice. You can also turn this off
                  if needed
                </li>
                <li>
                  Supports specialities (correctly handles removal by 1s with
                  speciality tens.)
                </li>
                <li>Supports guaranteed successes and guaranteed failures</li>
                <li>
                  Supports willpower use. Adds 1 automatic success and notes WP
                  as being used
                </li>
                <li>
                  Displays all dice as emojis in the order they were rolled. As
                  well as in text ordered for easy reading
                </li>
                <li>
                  Easy to read colour-coded output that tells you everything you
                  need to know about the roll at a glance
                </li>
                <li>
                  Supports linking of tracked characters. This will automaticly
                  remove willpower when used as well as display the characters
                  name in the roll
                </li>
                <li>Supports Nightmare dice</li>
                <li>Supports stand alone Initiative rolls</li>
                <li>Patreon vanity bonus for both rolls and trackers</li>
              </ul>
            </Typography>
            <Typography variant="h4" component="h2" color="primary">
              Initiative Tracker
            </Typography>
            <Typography component="div">
              <ul>
                <li>Tracks order of Initiative and Action Declarations</li>
                <li>Handles ties correctly</li>
                <li>
                  Keeps the tracker at the bottom of the channel every time a
                  command is used as well as deleting the old message to keep
                  the channel from becoming cluttered
                </li>
                <li>Pings users on their turn to declare an action</li>
                <li>Easy to use design</li>
                <li>
                  Easy to read output that shows only the information you need
                  to see
                </li>
                <li>Supports multiple characters from one User</li>
                <li>Supports multiple rounds and keeps track for you</li>
                <li>
                  Supports changing your roll before the reveal if you made a
                  mistake
                </li>
              </ul>
            </Typography>
            <Typography variant="h4" component="h2" color="primary">
              General Dice Roller
            </Typography>
            <Typography component="div">
              <ul>
                <li>Supports up to 5 dice sets to be used in one roll</li>
                <li>Supports modifiers</li>
                <li>Supports difficulty</li>
              </ul>
            </Typography>
            <Typography variant="h4" component="h2" color="primary">
              Character Tracker
            </Typography>
            <Typography component="div">
              <ul>
                <li>
                  Currently Supports tracking of Vampire the Masquerade 5th
                  Edition & World of Darkness 20th Edition
                </li>
                <li>
                  Easy to use Discord Slash Commands walk you through all the
                  arguments with helpful descriptions on all of them
                </li>
                <li>
                  Character security, not just anyone can lookup or modify a
                  character you have made
                </li>
                <li>
                  Supports Admin/Mod viewing of characters made on their server
                </li>
                <li>
                  Supports private creation and editing in DMs with the bot
                </li>
                <li>
                  Supports an ST tracker channel to see all the character
                  updates in real time in a channel no one else can view. No
                  more metagaming
                </li>
                <li>Does all calculations for you</li>
                <li>
                  Gives mechanical help when required such as when you take
                  damage
                </li>
              </ul>
            </Typography>
            <Typography variant="h6" component="h3" color="primary">
              Supported Character Types
            </Typography>
            <Typography component="div">
              <ul>
                <li>Vampire</li>
                <li>Ghoul</li>
                <li>Human</li>
                <li>Mage</li>
                <li>Werewolf</li>
                <li>Changeling</li>
                <li>Wraith</li>
                <li>Demon</li>
              </ul>
            </Typography>
          </Container>
        </Paper>
      </Grid2>
      <Grid2 size={12}>
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <ImageList variant="masonry" cols={3} gap={18}>
            {itemData.map((item) => (
              <ImageListItem key={item.img}>
                <img
                  src={`${item.img}?w=248&fit=crop&auto=format`}
                  srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  alt={item.title}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <ImageList cols={1} gap={20}>
            {itemData.map((item) => (
              <ImageListItem key={item.img}>
                <img
                  src={`${item.img}?w=248&fit=crop&auto=format`}
                  srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  alt={item.title}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </Grid2>
    </Grid2>
  );
}

const itemData = [
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001780499980754985/unknown.png",
    title: "20th Roll Passed",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001780793124864071/unknown.png",
    title: "20th Roll Failed",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001780918551314462/unknown.png",
    title: "20th Roll Botch",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001784395939729438/unknown.png",
    title: "20th Roll Nightmare",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001781557268316170/unknown.png",
    title: "20th Roll Spec",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001781278502293504/unknown.png",
    title: "20th Roll Willpower",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001781980469403709/unknown.png",
    title: "Initiative Tracker Roll",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001782214972932096/unknown.png",
    title: "Initiative Tracker Reveal",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001782904449409075/unknown.png",
    title: "Werewolf Tracker",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001689451094868008/unknown.png",
    title: "Character Tracker Impaired",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001783498807443567/unknown.png",
    title: "Dice roll options",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001692804369616996/unknown.png",
    title: "General Roll 1 set",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001693052622082079/unknown.png",
    title: "General Roll 2 sets",
  },
];

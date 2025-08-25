import { Container, Grid2, Typography } from "@mui/material";
import { Button, Box, ImageList, ImageListItem } from "@mui/material";
import { Link } from "react-router-dom";
import { Paper } from "@mui/material";

export default function CodIndex() {
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
          href="https://discord.com/oauth2/authorize?client_id=968461963816484915&scope=bot%20applications.commands&permissions=278528"
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
              Chronicles of Darkness
            </Typography>
            <Typography sx={{ pb: 2 }}>
              The Chronicles of Darkness bot contains a CoD Specific Dice Roller
              and a General Dice roller, new features are also being added all
              the time!
            </Typography>
            <Typography variant="h4" component="h2" color="primary">
              CoD Dice Roller
            </Typography>
            <Typography component="div">
              <ul>
                <li>
                  Supports rerolls and rote dice. Correctly handles the two
                  together
                </li>
                <li>Supports Bonus and Penalty dice</li>
                <li>Supports specialities</li>
                <li>Supports chance dice and automaticly adds it if needed</li>
                <li>Supports willpower use</li>
                <li>Supports modifying the target and reroll numbers</li>
                <li>
                  Easy to read colour-coded output that tells you everything you
                  need to know about the roll at a glance
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
    img: "https://media.discordapp.net/attachments/719420620701564968/1001715080326545468/unknown.png",
    title: "CoD Roll Success",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001715193681805352/unknown.png",
    title: "CoD Roll Success",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001715388486258728/unknown.png",
    title: "CoD Roll Rote Success",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001715618162151494/unknown.png",
    title: "CoD Roll Rote Exceptional Success",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001715825817964574/unknown.png",
    title: "CoD Roll Chance Failed",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001716257814499449/unknown.png",
    title: "CoD Roll Chance Dramatic fail",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001716574002106419/unknown.png",
    title: "CoD Roll Custom Options",
  },
  {
    img: "https://media.discordapp.net/attachments/719420620701564968/1001717895354650664/unknown.png",
    title: "CoD Roll Command Options",
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

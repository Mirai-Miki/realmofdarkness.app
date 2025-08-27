import { Box, Grid2, Typography } from "@mui/material";
import { Button, ButtonGroup } from "@mui/material";
import { Link } from "react-router-dom";
import Slideshow from "../components/Slideshow";

const large_logo =
  "https://res.cloudinary.com/dze64d7cr/image/upload/v1701410603/Logo/banner_bg_index.webp";

export default function WelcomePage(props) {
  return (
    <Grid2
      container
      spacing={{ md: 0, xs: 4 }}
      direction="row"
      justifyContent="space-evenly"
      alignItems="flex-start"
      columnSpacing={3}
    >
      <Grid2
        size={{
          md: 7,
          xs: 12,
        }}
      >
        <Box sx={{ pt: { xs: 0, md: 6 } }}>
          <Box
            component="img"
            sx={{ borderRadius: 5, width: "100%", height: "100%" }}
            alt="Realm of Darkness Logo"
            loading="eager"
            src={`${large_logo}`}
          ></Box>
          <Box sx={{ py: 2 }}>
            <Typography>
              Realm of Darkness is redefining the way you play World of Darkness
              TTRPGs on Discord, with bots for all major versions of the game.
            </Typography>
          </Box>
          <ButtonGroup
            variant="outlined"
            aria-label="outlined button group"
            sx={{ textAlign: "center" }}
          >
            <Button href="https://v5.realmofdarkness.app/">5th Edition</Button>
            <Button component={Link} to="20th/">
              20th Anniversary
            </Button>
            <Button component={Link} to="cod/">
              Chronicles of Darkness
            </Button>
          </ButtonGroup>
        </Box>
      </Grid2>
      <Grid2
        sx={{ height: { xs: "500px", lg: "600px" } }}
        size={{
          md: 5,
          xs: 12,
        }}
      >
        <Slideshow imageList={itemData} timer={5000} />
      </Grid2>
    </Grid2>
  );
}

const itemData = [
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701412082/Slideshow/fzdxpkhieryxy8rlpazy.webp",
    title: "Hunter Dice rolls",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701412083/Slideshow/bk1o4cjj0tmjnrw5ikju.webp",
    title: "Resonance Rolls",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701412082/Slideshow/ye5at9dlrpibqpwh4l2p.webp",
    title: "Trackers",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701412082/Slideshow/ww7jjnu69hlama2xlcjl.webp",
    title: "Vampire v5 dice rolls",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701412082/Slideshow/gxfukmqf2d0rtaacgsjy.webp",
    title: "Vampire v5 dice rolls",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701411461/Slideshow/pebptzzrnac7urujvmmf.webp",
    title: "Vampire v5 dice rolls",
  },
  {
    img: "https://res.cloudinary.com/dze64d7cr/image/upload/v1701411434/Slideshow/sxakjugtioeaosyi9owu.webp",
    title: "20th dice rolls",
  },
];

import { CardActionArea, CardContent, CardMedia } from "@mui/material";
import { Typography, Divider } from "@mui/material";
import V20HealthTracker from "../Trackers/V20HealthTracker";
import ExpBar from "../CharacterCards/ExpBar";
import ResponsiveRating from "../Trackers/ResponsiveRating";

const defaultImage =
  "https://res.cloudinary.com/dze64d7cr/image/upload/v1708659306/Logo/wraith_20th_logo.webp";

export default function Wraith20thInfo(props) {
  const { character, chronicle } = props;

  return (
    <CardActionArea disabled>
      <CardContent>
        <CardMedia
          component="img"
          image={character.faceclaim ? character.faceclaim : defaultImage}
          alt="Character Image"
          sx={{
            maxHeight: "250px",
            maxWidth: "250px",
            minHeight: "200px",
            minWidth: "100%",
            objectFit: "contain",
            mb: 2,
          }}
        />
        <Typography>Wraith - 20th Edition</Typography>
        <Typography>Server: {chronicle?.name ?? "None"}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>
          Willpower{" "}
          {`${character.willpower.current} / ${character.willpower.total}`}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.willpower.current,
            total: character.willpower.total,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>
          Corpus {`${character.corpus_current} / ${character.corpus_total}`}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.corpus_current,
            total: character.corpus_total,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Pathos {character.pathos}</Typography>
        <ResponsiveRating tracker={{ current: character.pathos, total: 10 }} />
        <Divider sx={{ my: 1 }} />
        <Typography>Health</Typography>
        <V20HealthTracker tracker={character.health} />
        <ExpBar exp={character.exp} />
      </CardContent>
    </CardActionArea>
  );
}

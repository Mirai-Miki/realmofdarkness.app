import { CardActionArea, CardContent, CardMedia } from "@mui/material";
import { Typography, Divider } from "@mui/material";
import V20HealthTracker from "../Trackers/V20HealthTracker";
import ExpBar from "../CharacterCards/ExpBar";
import ResponsiveRating from "../Trackers/ResponsiveRating";

const defaultImage =
  "https://res.cloudinary.com/dze64d7cr/image/upload/v1708659716/Logo/demon_20th_icon.webp";

export default function Demon20thInfo(props) {
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
        <Typography>Demon - 20th Edition</Typography>
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
          Faith {`${character.faith_current} / ${character.faith_total}`}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.faith_current,
            total: character.faith_total,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>
          Torment - Permanent: {character.torment_permanent}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.torment_permanent,
            total: 10,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>
          Torment - Temporary: {character.torment_temporary}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.torment_temporary,
            total: 10,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Health</Typography>
        <V20HealthTracker tracker={character.health} />
        <ExpBar exp={character.exp} />
      </CardContent>
    </CardActionArea>
  );
}

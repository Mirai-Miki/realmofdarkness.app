import { CardActionArea, CardContent, CardMedia } from "@mui/material";
import { Typography, Divider } from "@mui/material";
import V20HealthTracker from "../Trackers/V20HealthTracker";
import ExpBar from "../CharacterCards/ExpBar";
import ResponsiveRating from "../Trackers/ResponsiveRating";

const defaultImage =
  "https://res.cloudinary.com/dze64d7cr/image/upload/v1708658876/Logo/changeling_icon.webp";

export default function Changeling20thInfo(props) {
  const { character, chronicle } = props;

  return (
    <CardActionArea disabled>
      <CardContent>
        <CardMedia
          component="img"
          image={character.faceclaim ? character.faceclaim : defaultImage}
          alt="Character Image"
          sx={{
            maxHeight: "200px",
            maxWidth: "100%",
            minHeight: "200px",
            minWidth: "100%",
            objectFit: "contain",
            mb: 2,
          }}
        />
        <Typography>Changeling - 20th Edition</Typography>
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
        <Typography>Imbalence {`${character.imbalance}`}</Typography>
        <ResponsiveRating
          tracker={{ current: character.imbalance, total: 10 }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>
          Glamour
          {` ${character.glamour_current} / ${character.glamour_total}`}
        </Typography>
        <ResponsiveRating
          tracker={{
            current: character.glamour_current,
            total: character.glamour_total,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>
          Banality Permanent {`${character.banality_total}`}
        </Typography>
        <ResponsiveRating
          tracker={{ current: character.banality_total, total: 10 }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Banality Temporary {character.banality_current}</Typography>
        <ResponsiveRating
          tracker={{
            current: character.banality_current,
            total: 10,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Nightmare {`${character.nightmare}`}</Typography>
        <ResponsiveRating
          tracker={{ current: character.nightmare, total: 10 }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Chimerical Health</Typography>
        <V20HealthTracker
          tracker={{
            total: character.chimerical_total,
            bashing: character.chimerical_bashing,
            lethal: character.chimerical_lethal,
            aggravated: character.chimerical_aggravated,
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

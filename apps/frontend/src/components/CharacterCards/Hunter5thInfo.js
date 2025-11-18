import { CardActionArea, CardContent, CardMedia } from "@mui/material";
import { Typography, Divider } from "@mui/material";
import V5DamageTracker from "../Trackers/V5DamageTracker";
import ExpBar from "../CharacterCards/ExpBar";
import ResponsiveRating from "../Trackers/ResponsiveRating";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const defaultImage =
  "https://res.cloudinary.com/dze64d7cr/image/upload/v1708657296/Logo/hunter_logo.webp";

export default function Hunter5thInfo(props) {
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
        <Typography>Hunter - 5th Edition</Typography>
        <Typography>Server: {chronicle?.name ?? "None"}</Typography>
        <Divider sx={{ my: 1 }} />
        <V5DamageTracker label="Willpower" tracker={character.willpower} />
        <Divider sx={{ my: 1 }} />
        <V5DamageTracker label="Health" tracker={character.health} />
        <Divider sx={{ my: 1 }} />
        <Typography>Desperation {character.desperation}</Typography>
        <ResponsiveRating
          tracker={{
            current: character.desperation,
            total: 5,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography>Danger {character.danger}</Typography>
        <ResponsiveRating
          tracker={{
            current: character.danger,
            total: 5,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Typography sx={{ pt: 0.4, mb: -0.4 }}>
          Despair -
          {character.despair ? (
            <CheckBoxIcon sx={{ mb: -0.9, ml: 0.5, color: "#b51b3d" }} />
          ) : (
            <CheckBoxOutlineBlankIcon
              color="disabled"
              sx={{ mb: -0.9, ml: 0.5 }}
            />
          )}
        </Typography>
        <ExpBar exp={character.exp} />
      </CardContent>
    </CardActionArea>
  );
}

import { Rating, Typography, Stack } from "@mui/material";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";

export default function HaranoAndHauglosk(props) {
  const { harano, hauglosk } = props;

  const haranoBar = (
    <Rating
      readOnly
      max={5}
      value={harano}
      icon={<CircleIcon fontSize="inherit" />}
      emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
      size="small"
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        "& .MuiRating-iconFilled": { color: "#ab074e" },
        "& .MuiRating-iconHover": { color: "#ff3d47" },
      }}
    />
  );

  const haugloskBar = (
    <Rating
      readOnly
      max={5}
      value={hauglosk}
      icon={<CircleIcon fontSize="inherit" />}
      emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
      size="small"
      sx={{
        paddingLeft: 2,
        "& .MuiRating-iconFilled": { color: "#ab074e" },
        "& .MuiRating-iconHover": { color: "#ff3d47" },
      }}
    />
  );

  return (
    <Stack paddingBottom={0.5}>
      <Stack direction="row" alignItems="center">
        <Typography paddingLeft={0.5} variant="body1" align="left">
          {`Harano ${harano}`}
        </Typography>
        <Typography paddingLeft={4.5} variant="body1" align="right">
          {`Hauglosk ${hauglosk}`}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center">
        {haranoBar}
        {haugloskBar}
      </Stack>
    </Stack>
  );
}

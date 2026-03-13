import { Rating, Grid2 } from "@mui/material";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";

export default function ResponsiveRating(props) {
  const { tracker, hoverColor, filledColor } = props;
  const total = tracker?.total ? tracker.total : (props.total ?? 5);
  const bars = [];
  let currentCount = tracker.current;
  const totalBars = Math.floor((total - 1) / 5) + 1;

  for (let index = 0; index < totalBars; index++) {
    let value;
    if (currentCount <= 5) {
      value = currentCount;
      currentCount = 0;
    } else {
      value = 5;
      currentCount -= 5;
    }

    let max;
    if (index < totalBars - 1) max = 5;
    else max = total - (totalBars - 1) * 5;

    bars.push(
      <Grid2 key={index} sx={{ mt: 0.15, mb: -0.15 }}>
        <Rating
          readOnly
          max={max}
          value={value}
          icon={<CircleIcon fontSize="inherit" />}
          emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
          size="small"
          sx={{
            "& .MuiRating-iconFilled": { color: filledColor ?? "#ab074e" },
            "& .MuiRating-iconHover": { color: hoverColor ?? "#ff3d47" },
          }}
        />
      </Grid2>
    );
  }

  return (
    <Grid2
      container
      columnSpacing={1}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      {bars}
    </Grid2>
  );
}

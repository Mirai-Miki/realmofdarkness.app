import { Rating, Grid2 } from "@mui/material";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";
//import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

/*
function DotIcon(props)
{
  const { ...other } = props;
  return (<FiberManualRecordIcon fontSize="inherit" {...other} />)
}
*/
function FilledIcon(props) {
  const { ...other } = props;
  return <CircleIcon fontSize="inherit" {...other} />;
}

function EmptyIcon(props) {
  const { ...other } = props;
  return <CircleOutlinedIcon fontSize="inherit" {...other} />;
}

export default function OverflowRating(props) {
  const { tracker, max } = props;
  const total = tracker?.total ? tracker.total : (props.total ?? 10);
  const bars = [];

  let overflowCount = 0;
  let currentCount = tracker.current;
  let totalCount = total - currentCount;
  let maxCount = max ?? 10;
  if (currentCount > total) {
    overflowCount = tracker.current - total;
    currentCount = currentCount - overflowCount;
  }

  const totalBars = Math.floor((maxCount - 1) / 5) + 1;
  for (let index = 0; index <= totalBars; index++) {
    // Need 1 bar for every 5 points
    const bar = {};
    for (let i = 0; maxCount > 0 && i < 5; i++, maxCount--) {
      let icon = undefined;
      if (currentCount > 0) {
        icon = <FilledIcon sx={{ color: "#ab074e" }} />;
        currentCount--;
      } else if (overflowCount > 0) {
        icon = <FilledIcon sx={{ color: "#a1861b" }} />;
        overflowCount--;
      } else if (totalCount > 0) {
        icon = <EmptyIcon color="disabled" />;
        totalCount--;
      }
      bar[i + 1] = icon;
    }

    bars.push(
      <Grid2 key={index} sx={{ mt: 0.15, mb: -0.15 }}>
        <Rating
          name={`Overflow Tracker Bar ${index + 1}`}
          readOnly
          max={bar.length}
          IconContainerComponent={(props) => {
            const { value, ...other } = props;
            return bar[value] ? (
              <span {...other}>{bar[value]}</span>
            ) : undefined;
          }}
          defaultValue={5}
          size="small"
        />
      </Grid2>
    );
  }

  return (
    <Grid2
      container
      columnSpacing={1.5}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      {bars}
    </Grid2>
  );
}

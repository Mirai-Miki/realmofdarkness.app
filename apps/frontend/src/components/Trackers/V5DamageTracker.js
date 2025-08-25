import { Button, Rating, Stack, Typography, Grid2 } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

const AggravatedIcon = {
  icon: (
    <DisabledByDefaultIcon sx={{ mx: -0.1 }} style={{ color: "#ab0934" }} />
  ),
  label: "Aggravated Damage",
};

const SuperficialIcon = {
  icon: (
    <IndeterminateCheckBoxIcon sx={{ mx: -0.1 }} style={{ color: "#cf9013" }} />
  ),
  label: "Superficial Damage",
};

const NoDamageIcon = {
  icon: <CheckBoxOutlineBlankIcon sx={{ mx: -0.1 }} color="disabled" />,
  label: "No Damage",
};

export default function V5DamageTracker(props) {
  const { tracker, label, textAlign, justifyContent, onOpen, open, readOnly } =
    props;
  let totalCount = tracker.total;
  let supCount = tracker.superficial;
  let aggCount = tracker.aggravated;

  function handleOpen() {
    onOpen(label);
  }

  const bars = [];
  for (let index = 0; index <= Math.floor((tracker.total - 1) / 5); index++) {
    // Need 1 bar for every 5 points
    const bar = {};
    for (let i = 0; totalCount > 0 && i < 5; i++, totalCount--) {
      let icon = NoDamageIcon;
      if (aggCount) {
        icon = AggravatedIcon;
        aggCount--;
      } else if (supCount) {
        icon = SuperficialIcon;
        supCount--;
      }
      bar[i + 1] = icon;
    }

    bars.push(
      <Grid2 key={index} sx={{ mt: 0.15, mb: -0.15 }}>
        <Rating
          name={`Damage Tracker Bar ${index + 1}`}
          readOnly
          max={bar.length}
          IconContainerComponent={(props) => {
            const { value, ...other } = props;
            return bar[value] ? (
              <span {...other}>{bar[value].icon}</span>
            ) : undefined;
          }}
          defaultValue={5}
        />
      </Grid2>
    );
  }

  function openPanelButton() {
    if (readOnly)
      return (
        <Grid2 padding={0.6} size={12}>
          <Typography>{label}</Typography>
        </Grid2>
      );
    let render = <Typography>{label}</Typography>;
    const opened = open === label;
    const button = opened ? (
      <ExpandLessOutlinedIcon />
    ) : (
      <ExpandMoreOutlinedIcon />
    );
    const color = opened ? "primary" : "inherit";

    if (onOpen)
      render = (
        <Button
          onClick={handleOpen}
          size="small"
          endIcon={button}
          color={color}
        >
          <Typography sx={{ textTransform: "none" }}>{label}</Typography>
        </Button>
      );
    return render;
  }

  return (
    <Grid2
      container
      direction="column"
      justifyContent={justifyContent}
      alignItems={textAlign}
      textAlign={textAlign}
    >
      <Grid2>
        <Stack direction="row">{openPanelButton()}</Stack>
      </Grid2>
      <Grid2 container columnSpacing={1.5} justifyContent={justifyContent}>
        {bars}
      </Grid2>
    </Grid2>
  );
}

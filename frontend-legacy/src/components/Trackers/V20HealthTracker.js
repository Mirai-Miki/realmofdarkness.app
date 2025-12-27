import { Grid2, Rating } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

const AggravatedIcon = {
  icon: <BrokenImageIcon sx={{ mx: -0.1 }} style={{ color: "#990c99" }} />,
  label: "Aggravated Damage",
};

const LethalIcon = {
  icon: (
    <DisabledByDefaultIcon sx={{ mx: -0.1 }} style={{ color: "#ab0934" }} />
  ),
  label: "Lethal Damage",
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

export default function V20HealthTracker(props) {
  const { tracker } = props;
  let totalCount = tracker.total;
  let supCount = tracker.bashing;
  let lethalCount = tracker.lethal;
  let aggCount = tracker.aggravated;

  const bars = [];
  for (let index = 0; index <= Math.floor((tracker.total - 1) / 5); index++) {
    // Need 1 bar for every 5 points
    const bar = {};
    for (let i = 0; totalCount > 0 && i < 5; i++, totalCount--) {
      let icon = NoDamageIcon;
      if (aggCount) {
        icon = AggravatedIcon;
        aggCount--;
      } else if (lethalCount) {
        icon = LethalIcon;
        lethalCount--;
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

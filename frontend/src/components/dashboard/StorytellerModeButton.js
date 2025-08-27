import { Tooltip, IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

export default function StorytellerModeButton(props) {
  const { sortOptions, handleChange } = props;
  const mode = sortOptions.storytellerMode;

  return (
    <Tooltip title={`Storyteller Mode ${mode ? "On" : "Off"}`} arrow>
      <IconButton onClick={handleChange}>
        {mode ? (
          <FilterListIcon color="primary" />
        ) : (
          <FilterListOffIcon color="secondary" />
        )}
      </IconButton>
    </Tooltip>
  );
}

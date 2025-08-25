import { IconButton, Grid2 } from "@mui/material";
import BlurOnOutlinedIcon from "@mui/icons-material/BlurOnOutlined";
import * as React from "react";
import NewSheetControl from "./NewSheetControl";
import StorytellerModeButton from "./StorytellerModeButton";

export default function DashboardControls(props) {
  const { sortOptions, handleStorytellerMode } = props;
  return (
    <Grid2
      container
      columnSpacing={0}
      justifyContent="center"
      alignItems="center"
    >
      <NewSheetControl />
      <StorytellerModeButton
        sortOptions={sortOptions}
        handleChange={handleStorytellerMode}
      />
      <PlaceHolderButton />
      <PlaceHolderButton />
    </Grid2>
  );
}

function PlaceHolderButton(props) {
  return (
    <Grid2>
      <IconButton disabled>
        <BlurOnOutlinedIcon color="secondary" />
      </IconButton>
    </Grid2>
  );
}

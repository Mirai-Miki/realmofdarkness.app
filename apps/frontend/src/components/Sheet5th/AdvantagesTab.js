import { Stack, Grid2 } from "@mui/material";
import Header from "../Sheet/Header";
import Advantages from "./Advantages";
import AdvantagesViewDialogue from "./AdvantagesViewDialogue";
import { useState } from "react";

export default function AdvantagesTab() {
  const [isViewOpen, setIsViewOpen] = useState(false);

  function handleOpenView(item) {
    setIsViewOpen(item);
  }

  return (
    <Grid2 rowSpacing={2} container size={12} paddingBottom={2}>
      <Grid2
        size={{
          md: 12,
          lg: 6,
        }}
      >
        <Stack
          justifyContent="flex-start"
          sx={{ width: "100%" }}
          paddingBottom={2}
        >
          <Header>Merits</Header>
          <Advantages name="merits" handleOpenView={handleOpenView} />
        </Stack>
        <Stack
          justifyContent="flex-start"
          sx={{ width: "100%" }}
          paddingBottom={2}
        >
          <Header>Flaws</Header>
          <Advantages name="flaws" handleOpenView={handleOpenView} />
        </Stack>
        <Stack justifyContent="flex-start" sx={{ width: "100%" }}>
          <Header>Haven</Header>
          <Advantages name="haven" handleOpenView={handleOpenView} />
        </Stack>
      </Grid2>
      <Grid2
        size={{
          md: 12,
          lg: 6,
        }}
      >
        <Stack
          justifyContent="flex-start"
          sx={{ width: "100%" }}
          paddingBottom={2}
        >
          <Header>Backgrounds</Header>
          <Advantages name="backgrounds" handleOpenView={handleOpenView} />
        </Stack>
        <Stack justifyContent="flex-start" sx={{ width: "100%" }}>
          <Header>Loresheets</Header>
          <Advantages name="loresheets" handleOpenView={handleOpenView} />
        </Stack>
      </Grid2>
      <AdvantagesViewDialogue
        open={isViewOpen}
        handleClose={() => {
          setIsViewOpen(false);
        }}
      />
    </Grid2>
  );
}

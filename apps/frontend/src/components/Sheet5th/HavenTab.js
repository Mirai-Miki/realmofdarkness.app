import ApiTextField from "../Sheet/ApiTextField";
import { Stack, TextField, Grid2 } from "@mui/material";
import Header from "../Sheet/Header";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import RatingInfo from "./SheetRating";

export default function HavenTab() {
  const { sheet } = useSheetContext();
  return (
    <Grid2 container rowSpacing={2} size={12}>
      <Grid2
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Stack
          justifyContent="flex-start"
          sx={{ width: "100%" }}
          paddingBottom={2}
        >
          <Header>Advantages</Header>
          {sheet.haven.map((advantage, index) => (
            <Stack
              key={index}
              direction="row"
              sx={{
                minHeight: "40px",
                width: "100%",
                pointerEvents: "auto",
              }}
              paddingX={2}
            >
              <TextField
                fullWidth
                variant="standard"
                size="small"
                disabled
                value={advantage.name}
                sx={{ alignSelf: "center", pointerEvents: "none" }}
              />
              <RatingInfo
                locked
                value={advantage.rating}
                filledColor={advantage.flaw ? undefined : "#6f20ab"}
                sx={{ paddingTop: 1.5, paddingLeft: 1 }}
              />
            </Stack>
          ))}
        </Stack>
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Stack
          justifyContent="flex-start"
          sx={{ width: "100%" }}
          paddingBottom={2}
          spacing={2}
        >
          <Header>Info</Header>
          <ApiTextField
            label="Name"
            slug="haven_name"
            value={sheet.haven_name}
            maxLength={50}
            paddingX={2}
          />
          <ApiTextField
            label="Location"
            slug="haven_location"
            value={sheet.haven_location}
            maxLength={500}
            multiline
            rows={3}
            paddingX={2}
          />
          <ApiTextField
            label="Description"
            slug="haven_description"
            value={sheet.haven_description}
            maxLength={1000}
            multiline
            rows={20}
            paddingX={2}
          />
        </Stack>
      </Grid2>
    </Grid2>
  );
}

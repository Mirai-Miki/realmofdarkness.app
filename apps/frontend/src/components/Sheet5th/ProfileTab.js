import { Grid2 } from "@mui/material";
import ApiTextField from "../Sheet/ApiTextField";
import Header from "../Sheet/Header";

import { useSheetContext } from "../../routes/Character/Vampire5thSheet";

export default function ProfileTab() {
  const { sheet } = useSheetContext();

  return (
    <Grid2 spacing={2} container size={12} paddingBottom={2}>
      <Grid2
        container
        size={{
          xs: 12,
          md: 7,
        }}
      >
        <Header>History</Header>
        <Grid2 size={12}>
          <ApiTextField
            slug="history"
            value={sheet.history}
            maxLength={6000}
            onEnter={false}
            rows={19}
            multiline
          />
        </Grid2>
      </Grid2>
      <Grid2
        container
        justifyContent="flex-start"
        direction="column"
        spacing={2}
        size={{
          xs: 12,
          md: 5,
        }}
      >
        <Header>Profile</Header>
        <Grid2 container size={12}>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ApiTextField
              label="Date of Birth"
              slug="date_of_birth"
              value={sheet.date_of_birth}
              maxLength={20}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ApiTextField
              label="Date of Death"
              slug="date_of_death"
              value={sheet.date_of_death}
              maxLength={20}
            />
          </Grid2>
        </Grid2>
        <Grid2 container size={12}>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ApiTextField
              label="Age"
              slug="age"
              value={sheet.age}
              maxLength={20}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ApiTextField
              label="Apparent Age"
              slug="apparent_age"
              value={sheet.apparent_age}
              maxLength={20}
            />
          </Grid2>
        </Grid2>
        <Grid2 size={12}>
          <ApiTextField
            label="Appearance"
            slug="appearance_description"
            value={sheet.appearance_description}
            maxLength={1000}
            multiline
            rows={14}
          />
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

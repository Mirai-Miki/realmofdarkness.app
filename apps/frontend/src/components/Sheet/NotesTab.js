import { Grid2 } from "@mui/material";
import ApiTextField from "../Sheet/ApiTextField";

import { useSheetContext } from "../../routes/Character/Vampire5thSheet";

export default function NotesTab() {
  const { sheet } = useSheetContext();

  return (
    <Grid2 container size={12} spacing={2} paddingBottom={2}>
      <Grid2
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <ApiTextField
          slug="notes"
          value={sheet.notes}
          noLock
          onEnter={false}
          maxLength={6000}
          multiline
          rows={22}
        />
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <ApiTextField
          slug="notes2"
          value={sheet.notes2}
          noLock
          onEnter={false}
          maxLength={6000}
          multiline
          rows={22}
        />
      </Grid2>
    </Grid2>
  );
}

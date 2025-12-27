import { Grid2 } from "@mui/material";
import ApiTextField from "../../Sheet/ApiTextField";
import { useSheetContext } from "../../../routes/Character/Vampire5thSheet";
import Header from "../../Sheet/Header";

export default function HuntingTab(props) {
  const { sheet } = useSheetContext();

  return (
    <Grid2
      container
      spacing={1}
      paddingBottom={2}
      direction="column"
      size={{
        xs: 12,
        md: 4,
      }}
    >
      <Header>Hunting</Header>
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        paddingTop={1}
        size={12}
      >
        <Grid2>
          <ApiTextField
            label="Hunting Roll"
            value={sheet.hunting_roll}
            maxLength={50}
          />
        </Grid2>
        <Grid2>
          <ApiTextField
            label="Resonance"
            value={sheet.resonance}
            maxLength={50}
          />
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

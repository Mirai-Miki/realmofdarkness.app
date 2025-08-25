import { Grid2 } from "@mui/material";
import Attribute from "./Attribute";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import Header from "../Sheet/Header";

export default function AttributesTab(props) {
  const { sheet } = useSheetContext();
  const attr = sheet.attributes;

  return (
    <Grid2 container spacing={2} size={12}>
      <Header>Attributes</Header>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Attribute name="Strength" dots={attr.strength} />
        <Attribute name="Dexterity" dots={attr.dexterity} />
        <Attribute name="Stamina" dots={attr.stamina} />
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Attribute name="Charisma" dots={attr.charisma} />
        <Attribute name="Manipulation" dots={attr.manipulation} />
        <Attribute name="Composure" dots={attr.composure} />
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Attribute name="Intelligence" dots={attr.intelligence} />
        <Attribute name="Wits" dots={attr.wits} />
        <Attribute name="Resolve" dots={attr.resolve} />
      </Grid2>
    </Grid2>
  );
}

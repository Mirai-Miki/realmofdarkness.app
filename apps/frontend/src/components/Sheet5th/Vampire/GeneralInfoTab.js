import { useSheetContext } from "../../../routes/Character/Vampire5thSheet";
import SheetControls from "../SheetControls";
import DialogueTextField from "../../Sheet/DialogueTextField";
import ExpTextField from "../../Sheet/ExpTextField";
import ApiTextField from "../../Sheet/ApiTextField";
import { getClans, getClanInfo, getPredatorTypes } from "../../../constants/";
import ApiSelect from "../../Sheet/ApiSelect";
import GenerationMenuItems from "./GenerationMenuItems";
import SheetStatusMenuItems from "../../Sheet/SheetStatusMenuItems";
import ChronicleMenuItems from "./ChronicleMenuItems";
import { useClientContext } from "../../ClientProvider";
import { TextField, Grid2 } from "@mui/material";

export default function GeneralInfoTab(props) {
  const { sheet, handleUpdate } = useSheetContext();
  const { user, members } = useClientContext();
  const { handleLockChange } = props;

  async function handleStLockChange() {
    await handleUpdate({ st_lock: !sheet.st_lock });
  }

  function renderChronicleOrUser() {
    if (sheet.user === user.id) {
      return (
        <Grid2
          container
          minWidth={315}
          direction="column"
          size={{ xs: 12, md: "auto" }}
        >
          <ApiTextField label="Name" value={sheet.name} maxLength={50} />
          <ApiSelect
            label="Chronicle"
            value={sheet.chronicle ?? ""}
            getOptions={ChronicleMenuItems}
          />
        </Grid2>
      );
    } else {
      return (
        <Grid2
          container
          minWidth={315}
          direction="column"
          size={{ xs: 12, md: "auto" }}
        >
          <ApiTextField label="Name" value={sheet.name} maxLength={50} />
          <Grid2 size={{ xs: 12, md: "auto" }} paddingX={1}>
            <TextField
              disabled
              label="User"
              value={members[sheet.chronicle][sheet.user].nickname}
              fullWidth
              size={"small"}
            />
          </Grid2>
        </Grid2>
      );
    }
  }

  return (
    <Grid2 container spacing={2} size={{ xs: 12 }}>
      <Grid2
        container
        size={{ md: 10 }}
        paddingY={3}
        columnGap={1}
        justifyContent="center"
      >
        {renderChronicleOrUser()}
        <Grid2
          container
          minWidth={{ xs: 315, lg: 415 }}
          direction="column"
          size={{ xs: 12, md: "auto" }}
        >
          <ApiTextField
            label="Ambition"
            value={sheet.ambition}
            maxLength={100}
          />
          <ApiTextField label="Desire" value={sheet.desire} maxLength={100} />
        </Grid2>
        <Grid2
          container
          minWidth={315}
          direction="column"
          size={{ xs: 12, md: "auto" }}
        >
          <DialogueTextField
            label="Clan"
            value={sheet.clan}
            getData={getClans}
            getItemInfo={getClanInfo}
          />
          <ApiSelect
            label="Generation"
            value={sheet.generation}
            getOptions={GenerationMenuItems}
          />
        </Grid2>
        <Grid2
          container
          minWidth={315}
          direction="column"
          size={{ xs: 12, md: "auto" }}
        >
          <ApiTextField label="Sire" value={sheet.sire} maxLength={50} />
          <DialogueTextField
            label="Predator Type"
            value={sheet.predator_type}
            getData={getPredatorTypes}
          />
        </Grid2>
        <Grid2
          container
          maxWidth={{ xs: "auto", md: 215 }}
          direction={{ xs: "row", md: "column" }}
          size={{ xs: 12, md: "auto" }}
        >
          <ApiSelect
            label="Sheet Status"
            value={sheet.status}
            slug="status"
            getOptions={SheetStatusMenuItems}
            xs={6}
          />
          <ExpTextField label="Experience" exp={sheet.exp} xs={6} />
        </Grid2>
      </Grid2>
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        rowSpacing={-3}
        spacing={2}
        size={{ xs: 12, md: 2 }}
      >
        <SheetControls
          handleLockChange={handleLockChange}
          handleStLockChange={handleStLockChange}
        />
      </Grid2>
    </Grid2>
  );
}

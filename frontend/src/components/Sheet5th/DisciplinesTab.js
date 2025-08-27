import { Button, Grid2 } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Discipline from "./Discipline";
import NewDisciplineDialog from "./Vampire/CustomDisciplineDialog";
import { PowerDialogue, PowerDialogueView } from "./DisciplinePower";
import Header from "../Sheet/Header";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import { useAlertContext } from "../../components/AlertProvider";
import { useState } from "react";

const powerTemplate = {
  name: "",
  amalgam: "",
  description: "",
  cost: "",
  dice_pool: "",
  system: "",
  duration: "",
};

export default function DisciplinesTab(props) {
  const { lock, sheet, handleUpdate } = useSheetContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [powerDialogOpen, setPowerDialogOpen] = useState(false);
  const [powerDialogView, setPowerDialogView] = useState(false);
  const [updateDiscipline, setUpdate] = useState(null);
  const { pushAlert } = useAlertContext();

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setUpdate(null);
    setDialogOpen(false);
  }

  function openPowerDialog(discipline, level) {
    setUpdate({ discipline, level });
    setPowerDialogOpen(true);
  }

  function closePowerDialog() {
    setUpdate(null);
    setPowerDialogOpen(false);
  }

  function openPowerDialogView(discipline, level) {
    setPowerDialogView({ discipline, level });
  }

  function closePowerDialogView() {
    setPowerDialogView(false);
  }

  function updateCustomDiscipline(discipline) {
    setUpdate(discipline);
    openDialog();
  }

  async function handleDisciplineUpdate(discipline, update, oldName) {
    if (!update && discipline.name in sheet.disciplines) {
      pushAlert({
        title: "Discipline Exists!",
        message: "You already have a discipline with this name.",
      });
      return;
    }

    if (!discipline.value) discipline.value = 0;
    if (!discipline.description) discipline.description = [];
    if (!discipline.characteristics) discipline.characteristics = [];
    discipline.custom = 0;
    discipline.source = "";
    if (!discipline.powers)
      discipline.powers = { 1: null, 2: null, 3: null, 4: null, 5: null };

    for (let i = 1; i <= 5; i++) {
      if (discipline.powers[i] === null && i <= discipline.value)
        discipline.powers[i] = powerTemplate;
      else if (i <= discipline.value) continue;
      else discipline.powers[i] = null;
    }

    const newDisciplines = JSON.parse(JSON.stringify(sheet.disciplines));
    if (oldName) delete newDisciplines[oldName];
    newDisciplines[discipline.name] = discipline;
    await handleUpdate({ disciplines: newDisciplines });
  }

  async function deleteDiscipline(name) {
    const newDisciplines = JSON.parse(JSON.stringify(sheet.disciplines));
    delete newDisciplines[name];
    await handleUpdate({ disciplines: newDisciplines });
  }

  const addNewButton = (
    <Grid2 minWidth="300px">
      <Button fullWidth variant="outlined" onClick={openDialog}>
        <AddIcon fontSize="small" />
        New Discipline
      </Button>
    </Grid2>
  );

  return (
    <Grid2 container spacing={2} size={12}>
      <Header>Disciplines</Header>
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        paddingTop={1}
        minHeight={80}
        size={12}
      >
        {sheet.disciplines &&
          Object.entries(sheet.disciplines).map(
            ([disciplineName, discipline]) => (
              <Discipline
                key={disciplineName}
                discipline={discipline}
                updateCustomDiscipline={updateCustomDiscipline}
                updateDiscipline={handleDisciplineUpdate}
                deleteDiscipline={deleteDiscipline}
                openPowerDialog={openPowerDialog}
                openPowerDialogView={openPowerDialogView}
              />
            )
          )}
        {!lock ? addNewButton : null}
      </Grid2>
      <NewDisciplineDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleDisciplineUpdate}
        update={updateDiscipline}
      />
      <PowerDialogue
        open={powerDialogOpen}
        onClose={closePowerDialog}
        onSave={handleDisciplineUpdate}
        update={updateDiscipline}
      />
      <PowerDialogueView
        info={powerDialogView}
        onClose={closePowerDialogView}
      />
    </Grid2>
  );
}

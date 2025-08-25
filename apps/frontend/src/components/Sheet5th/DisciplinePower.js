import {
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Grid2,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";

export function Power(props) {
  const { level, power, lock, openDialogue, openView } = props;

  const action = (
    <Tooltip title="Edit Power" arrow>
      <IconButton color="secondary" onClick={openDialogue}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      onClick={
        lock
          ? (event) => {
              // Call the function to show details
              openView();
              // Stop the propagation to prevent Accordion from expanding
              event.stopPropagation();
            }
          : null
      }
      sx={
        lock
          ? {
              "&:hover": {
                cursor: "pointer",
                color: "#d8bf31",
              },
            }
          : {}
      }
    >
      <Typography>
        {level}: {power.name}
      </Typography>{" "}
      {!lock ? action : null}
    </Stack>
  );
}

export function PowerDialogue(props) {
  const { open, onClose, onSave, update } = props;
  const discipline = update?.level ? update.discipline : {};
  const power = update?.level ? discipline.powers[update.level] : {};

  const [name, setName] = useState(power?.name ?? "");
  const [amalgam, setAmalgam] = useState(power?.amalgam ?? "");
  const [description, setDescription] = useState(power?.description ?? "");
  const [cost, setCost] = useState(power?.cost ?? "");
  const [dicePool, setDicePool] = useState(power?.dice_pool ?? "");
  const [system, setSystem] = useState(power?.system ?? "");
  const [duration, setDuration] = useState(power?.duration ?? "");

  useEffect(() => {
    setName(power?.name ?? "");
    setAmalgam(power?.amalgam ?? "");
    setDescription(power?.description ?? "");
    setCost(power?.cost ?? "");
    setDicePool(power?.dice_pool ?? "");
    setSystem(power?.system ?? "");
    setDuration(power?.duration ?? "");
  }, [
    power?.name,
    power?.amalgam,
    power?.description,
    power?.cost,
    power?.dice_pool,
    power?.system,
    power?.duration,
  ]);

  const handleOnSave = async () => {
    const newDisc = JSON.parse(JSON.stringify(discipline));
    newDisc.powers[update?.level] = {
      name,
      amalgam,
      description,
      cost,
      dice_pool: dicePool,
      system,
      duration,
    };

    await onSave(newDisc, true);
    onClose();
  };

  const updateText = (text, oldValue, set, max) => {
    if (text.length < oldValue.length) set(text);
    else if (text.length > max) return;
    else set(text);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle color="primary" sx={{ textAlign: "center" }}>
        {discipline?.name} Level {update?.level}
      </DialogTitle>
      <DialogContent>
        <Grid2 container spacing={2} paddingY={1}>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              label="Power Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => updateText(e.target.value, name, setName, 50)}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              label="Amalgam"
              variant="outlined"
              onChange={(e) =>
                updateText(e.target.value, amalgam, setAmalgam, 50)
              }
              fullWidth
              value={amalgam}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              label="Cost"
              variant="outlined"
              fullWidth
              multiline
              maxRows={10}
              onChange={(e) => updateText(e.target.value, cost, setCost, 50)}
              value={cost}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              label="Dice Pool"
              variant="outlined"
              fullWidth
              multiline
              maxRows={10}
              onChange={(e) =>
                updateText(e.target.value, dicePool, setDicePool, 200)
              }
              value={dicePool}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              label="Duration"
              variant="outlined"
              fullWidth
              multiline
              maxRows={10}
              onChange={(e) =>
                updateText(e.target.value, duration, setDuration, 50)
              }
              value={duration}
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              onChange={(e) =>
                updateText(e.target.value, description, setDescription, 1000)
              }
              value={description}
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="System"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              onChange={(e) =>
                updateText(e.target.value, system, setSystem, 1000)
              }
              value={system}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOnSave}
          fullWidth
        >
          Update Power
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PowerDialogueView(props) {
  const { info, onClose } = props;
  const open = info ? true : false;
  const discipline = info?.discipline;
  const level = info?.level;
  const power = discipline?.powers[level];

  function renderDetails() {
    let amalgam = null;
    let description = null;
    let cost = null;
    let dicePool = null;
    let system = null;
    let duration = null;

    if (power?.amalgam)
      amalgam = (
        <Stack direction="row" spacing={1}>
          <Typography color="primary">■ Amalgam:</Typography>
          <Typography>{power?.amalgam}</Typography>
        </Stack>
      );

    if (power?.description) {
      const lines = power?.description.split("\n");
      let descriptionParts = [];
      let index = 0;
      for (const line of lines) {
        descriptionParts.push(
          <Typography key={index}>{line ? line : <br />}</Typography>
        );
        index++;
      }
      description = <Stack>{descriptionParts}</Stack>;
    }

    if (power?.cost)
      cost = (
        <Stack direction="row" spacing={1}>
          <Typography color="primary">■ Cost:</Typography>
          <Typography>{power?.cost}</Typography>
        </Stack>
      );

    if (power?.dice_pool)
      dicePool = (
        <Stack direction="row" spacing={1}>
          <Typography color="primary">■ Dice Pool:</Typography>
          <Typography>{power?.dice_pool}</Typography>
        </Stack>
      );

    if (power?.system) {
      const lines = power?.system.split("\n");
      let systemParts = [];
      let index = 0;
      for (const line of lines) {
        systemParts.push(
          <Typography key={index}>{line ? line : <br />}</Typography>
        );
        index++;
      }
      system = (
        <Stack spacing={1}>
          <Typography color="primary">■ System:</Typography>
          {systemParts}
        </Stack>
      );
    }

    if (power?.duration)
      duration = (
        <Stack direction="row" spacing={1}>
          <Typography color="primary">■ Duration:</Typography>
          <Typography>{power?.duration}</Typography>
        </Stack>
      );

    return (
      <Stack direction="column" spacing={2}>
        {amalgam}
        {description}
        {cost}
        {dicePool}
        {system}
        {duration}
      </Stack>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle color="primary" sx={{ textAlign: "center" }}>
        {discipline?.name} level {level} - {power?.name}
      </DialogTitle>
      <DialogContent>{renderDetails()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

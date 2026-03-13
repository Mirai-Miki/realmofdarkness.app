import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  DialogActions,
  Grid2,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function CustomDisciplineDialog({
  open,
  onClose,
  onSave,
  update,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [oldName, setOldName] = useState("");

  const handleAddDiscipline = async () => {
    let descriptionArray;
    let characteristicsArray;
    if (description !== "") descriptionArray = description?.split("\n");
    if (characteristics !== "")
      characteristicsArray = characteristics?.split("\n");

    let newDisc = {
      name,
      description: descriptionArray,
      characteristics: characteristicsArray,
      value: 0,
    };
    if (update) newDisc = JSON.parse(JSON.stringify(update));
    newDisc.name = name;
    newDisc.description = descriptionArray;
    newDisc.characteristics = characteristicsArray;

    await onSave(newDisc, update, oldName);
    onClose();
  };

  useEffect(() => {
    setName("");
    setDescription("");
    setCharacteristics("");
  }, [open]);

  useEffect(() => {
    if (!update) {
      setName("");
      setOldName("");
      setDescription("");
      setCharacteristics("");
    } else {
      setName(update.name);
      setOldName(update.name);
      setDescription(update.description?.join("\n") ?? "");
      setCharacteristics(update.characteristics?.join("\n") ?? "");
    }
  }, [update]);

  const updateText = (text, oldValue, set, max) => {
    if (text.length < oldValue.length) set(text);
    else if (text.length > max) return;
    else set(text);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle color="primary" sx={{ textAlign: "center" }}>
        {update ? "Update" : "New"} Custom Discipline
      </DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="Discipline Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => updateText(e.target.value, name, setName, 50)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddDiscipline();
              }}
              required
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="Discipline Description"
              variant="outlined"
              fullWidth
              multiline
              maxRows={10}
              value={description}
              onChange={(e) =>
                updateText(e.target.value, description, setDescription, 4000)
              }
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="Discipline Characteristics"
              variant="outlined"
              fullWidth
              multiline
              maxRows={10}
              value={characteristics}
              onChange={(e) =>
                updateText(
                  e.target.value,
                  characteristics,
                  setCharacteristics,
                  3000
                )
              }
            />
          </Grid2>
          {/* Add other fields for the new discipline here */}
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDiscipline}
          fullWidth
          disabled={name ? false : true}
        >
          {update ? "Update" : "Add"} Discipline
        </Button>
      </DialogActions>
    </Dialog>
  );
}

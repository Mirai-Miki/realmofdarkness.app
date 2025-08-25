import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  DialogActions,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

export default function SpecialtyDialogue({
  name,
  spec,
  open,
  onClose,
  onSave,
}) {
  const [newSpecialty, setNewSpecialty] = useState("");

  const handleDelete = (index) => {
    const updatedSpecialties = [...spec];
    updatedSpecialties.splice(index, 1);
    onSave(updatedSpecialties);
  };

  const handleAdd = () => {
    if (newSpecialty.trim() !== "") {
      const updatedSpecialties = [...spec, newSpecialty.trim()];
      onSave(updatedSpecialties);
      setNewSpecialty("");
    }
  };

  const updateSpecName = (spec) => {
    if (spec.length < newSpecialty.length) setNewSpecialty(spec);
    else if (spec.length > 50) return;
    else setNewSpecialty(spec);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle color="primary" sx={{ textAlign: "center" }}>
        {name} Specialties
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
      <DialogContent sx={{ maxHeight: "80vh" }}>
        <List>
          {spec.map((spec, index) => (
            <ListItem key={index}>
              <ListItemText primary={spec} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
          <TextField
            label="Add Specialty"
            variant="outlined"
            fullWidth
            value={newSpecialty}
            onChange={(e) => updateSpecName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

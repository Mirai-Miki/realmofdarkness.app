import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Grid2,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { pink } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { getHost, getCSRFToken } from "../../utility";
import { useAlertContext } from "../AlertProvider";

export default function DeleteCharacterButton(props) {
  const { characterId, button } = props;
  const [open, setOpen] = useState(false);
  const { pushAlert } = useAlertContext();
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `${getHost(true)}/api/character/delete?id=${characterId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
        }
      );
      if (response.status === 200 || response.status === 204) {
        // Character was deleted or didn't exist, redirect to home
        const currentUrl = window.location.pathname;
        pushAlert({ message: "Character deleted", severity: "success" });
        if (currentUrl !== "/") return navigate("/");
        else return handleClose();
      } else if (response.status === 403) {
        // Forbidden, show an alert or handle it as needed
        const message = "You are not allowed to delete this character";
        pushAlert({ title: "Permission Error", message });
        return handleClose();
      } else {
        const message = "An error occurred while deleting the character";
        pushAlert({ title: "API Error", message });
        return handleClose();
      }
    } catch (error) {
      const message = "An error occurred while making the API request";
      pushAlert({ title: "API Error", message });
      console.error(message, error);
      return handleClose();
    }
  };

  let deleteButton;
  if (button) {
    deleteButton = (
      <Button size="small" color="error" onClick={handleOpen}>
        Delete
      </Button>
    );
  } else {
    deleteButton = (
      <IconButton onClick={handleOpen}>
        <DeleteForeverIcon fontSize="large" sx={{ color: pink[500] }} />
      </IconButton>
    );
  }

  return (
    <Grid2>
      <Tooltip title="Delete" arrow>
        {deleteButton}
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle color="error">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this character? This action is
            permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="outlined" color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid2>
  );
}

import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  Tooltip,
  Grid2,
} from "@mui/material";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";

export default function SheetPreviewNews() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid2>
      <Tooltip title="Sheet News" arrow>
        <IconButton onClick={handleOpen}>
          <AnnouncementOutlinedIcon fontSize="large" color="secondary" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle color="primary">Sheet News</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome to the Vampire 5th edition full sheet. The sheet is now
            considered in a baseline feature complete state with everything you
            would expect from a PDF sheet and more! There are still some things
            that need to be improved upon such as autocompleting for a lot of
            fields and that will be worked on over time. For now Enjoy the
            sheet!
          </DialogContentText>
        </DialogContent>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </Dialog>
    </Grid2>
  );
}

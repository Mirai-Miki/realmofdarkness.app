import { Tooltip, IconButton } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useState } from 'react';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import NewSheetDialogue from "./NewSheetDialogue";

export default function NewSheetControl(props)
{
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <Grid>
      <Tooltip title="New Sheet" arrow> 
        <IconButton onClick={handleClickOpen}>
          <FeedOutlinedIcon color="secondary" />
        </IconButton>         
      </Tooltip>
      <NewSheetDialogue 
        open={open} 
        onClose={handleClose}
      />
    </Grid>
  )
}
import { Button, TextField, Grid2 } from "@mui/material";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import { useState } from "react";
import SelectionDialogue from "./SelectionDialogue";

export default function DialogueTextField(props) {
  const { label, value, xs, getData, getItemInfo } = props;
  const { lock } = useSheetContext();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = async (value) => {
    setOpen(false);
  };

  const textField = (
    <TextField
      disabled
      value={value ?? ""}
      label={label}
      variant="outlined"
      fullWidth
      size="small"
    />
  );

  const button = (
    <Button
      fullWidth
      variant="outlined"
      sx={{ paddingBottom: "8.5px" }}
      onClick={handleClickOpen}
    >
      {`${label}${value ? ": " + value : ""}`}
    </Button>
  );

  return (
    <>
      <SelectionDialogue
        label={label}
        selected={value}
        open={open}
        onClose={handleClose}
        getData={getData}
        getItemInfo={getItemInfo}
      />
      <Grid2
        size={{
          xs: xs ?? 12,
          md: "auto",
        }}
      >
        {lock ? textField : button}
      </Grid2>
    </>
  );
}

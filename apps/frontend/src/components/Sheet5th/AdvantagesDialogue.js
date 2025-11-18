import {
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import RatingInfo from "./SheetRating";
import { useEffect, useState } from "react";
import options from "./AdvantagesOptions";

export default function AdvantagesDialogue(props) {
  const { open, onClose, onSave, slug, item } = props;
  let title = slug.charAt(0).toUpperCase() + slug.slice(1);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [flaw, setFlaw] = useState(slug === "flaws" ? true : false);
  const [modifier, setModifier] = useState(0);
  const [modifierError, setModifierError] = useState(false);

  let optionsSet;
  switch (slug) {
    case "merits":
      optionsSet = options.meritsOptions;
      break;
    case "flaws":
      optionsSet = options.flawsOptions;
      break;
    case "haven":
      optionsSet = options.havenOptions;
      break;
    case "backgrounds":
      optionsSet = options.backgroundsOptions;
      break;
    case "loresheets":
      optionsSet = options.loresheetsOptions;
      break;
    default:
      optionsSet = undefined;
  }

  useEffect(() => {
    setName(item?.name ?? "");
    setRating(item?.rating ?? 0);
    setDescription(item?.description ?? "");
    setNotes(item?.notes ?? "");
    setFlaw(item?.flaw ?? (slug === "flaws" ? true : false));
    setModifier(item?.modifier ?? 0);
  }, [item, slug]);

  let disableSave = true;
  if (name && rating > 0 && !modifierError) disableSave = false;
  else disableSave = true;

  let disableFlawMarker = false;
  if (slug === "flaws" || slug === "loresheets" || slug === "merits")
    disableFlawMarker = true;

  const handleSave = () => {
    onSave({ name, rating, description, notes, flaw, modifier });
    handleClose();
  };

  const parseText = (event, maxLength, set) => {
    const value = event.target.value;
    if (value.length > maxLength) set(value.slice(0, maxLength));
    else set(value);
  };

  const parseModifier = (event) => {
    const value = event.target.value;
    if (!value.match(/^$|^\d{1,2}$/)) return;
    setModifier(value);
  };

  const blurModifier = () => {
    if (!isNaN(parseInt(modifier))) {
      setModifier(parseInt(modifier));
      if (modifierError) setModifierError(false);
    } else if (!modifierError) setModifierError(true);
  };

  const handleAutocompleteChange = (newValue) => {
    const existingOption = optionsSet.find(
      (option) => option.name === newValue
    );
    if (existingOption) {
      // Option exists in the list, update state with predefined variables
      setName(existingOption.name);
      setRating(existingOption.rating);
      setDescription(existingOption.description);
      setFlaw(existingOption.flaw);
      setModifier(existingOption.modifier);
      setModifierError(false); // Reset modifier error
    } else {
      // Option doesn't exist in the list, update only the name
      setName(newValue);
    }
  };

  const handleClose = () => {
    setName("");
    setRating(0);
    setDescription("");
    setNotes("");
    setFlaw(slug === "flaws" ? true : false);
    setModifier(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle color="primary" alignSelf="center">
        {item ? "Update" : "Add"} {title}
      </DialogTitle>
      <DialogContent>
        <Stack paddingTop={1} spacing={2}>
          <Stack direction="row" spacing={2}>
            <AdvantagesAutocomplete
              value={name}
              optionSet={optionsSet}
              onChange={handleAutocompleteChange}
              id={slug + "autocomplete"}
            />
            <RatingInfo
              size="medium"
              name="rating"
              value={rating}
              sx={{ paddingTop: 1 }}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              id={slug + "modifier"}
              error={modifierError}
              label="Dice Modifier"
              size="small"
              value={modifier}
              onChange={parseModifier}
              onBlur={blurModifier}
            />
            <FormGroup id={slug + "form"}>
              <FormControlLabel
                label="Flaw"
                id={slug + "formLabel"}
                control={
                  <Checkbox
                    id={slug + "formCheckbox"}
                    color="error"
                    disabled={disableFlawMarker}
                    checked={flaw}
                    onChange={(e) => setFlaw(e.target.checked)}
                  />
                }
              />
            </FormGroup>
          </Stack>
          <TextField
            id={slug + "description"}
            label="Description"
            size="small"
            value={description}
            multiline
            minRows={3}
            maxRows={5}
            onChange={(e) => parseText(e, 1000, setDescription)}
            fullWidth
          />
          <TextField
            id={slug + "notes"}
            label="Notes"
            size="small"
            value={notes}
            multiline
            minRows={3}
            maxRows={5}
            onChange={(e) => parseText(e, 1000, setNotes)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="warning" onClick={handleClose}>
          Cancel
        </Button>
        <Button disabled={disableSave} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AdvantagesAutocomplete(props) {
  const { optionSet, onChange, id, value } = props;

  return (
    <Autocomplete
      freeSolo
      inputValue={value}
      id={id}
      options={optionSet}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.name}
      onInputChange={(event, newValue) => onChange(newValue)}
      fullWidth
      renderInput={(params) => (
        <TextField {...params} label="Name" size="small" required />
      )}
    />
  );
}

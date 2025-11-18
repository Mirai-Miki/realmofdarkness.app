import { TextField, Grid2 } from "@mui/material";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import { useState, useEffect } from "react";
import { slugify } from "../../utility";

export default function ApiTextField(props) {
  const {
    label,
    value,
    slug,
    maxLength,
    noLock = false,
    variant = "outlined",
    size = "small",
    onEnter = true,
    save,
    paddingX = 0,
    xs = 12,
    md = "auto",
    ...other
  } = props;

  const { lock, handleUpdate } = useSheetContext();
  const disable = lock && !noLock;

  const handleSave = save ? save : handleUpdate;

  const [field, setField] = useState(value);
  const [error, setError] = useState(false);
  const [color, setColor] = useState("primary");
  const [focused, setFocused] = useState(false);

  function onChange(event) {
    let newValue = event.target.value;
    if (maxLength && newValue.length > maxLength) return;
    setField(newValue);
  }

  function onClick() {
    setFocused(true);
  }

  async function onBlur() {
    if (value === field) return setFocused(false);
    setColor("secondary");
    const name = slug ?? slugify(label);
    const updatedValue = field ?? "";
    const response = { [name]: updatedValue };

    const res = await handleSave(response);
    if (res === "error") {
      setError(true);
      setColor("primary");
      setFocused(false);
      setTimeout(() => setError(false), 5000);
    } else {
      setColor("success");
      setTimeout(() => {
        setColor("primary");
        setFocused(false);
      }, 2000);
    }
  }

  function onKeyDown(event) {
    if (onEnter && event.key === "Enter") {
      event.target.blur();
    }
  }

  useEffect(() => {
    setField(value);
  }, [value]);

  return (
    <Grid2
      paddingX={paddingX}
      size={{
        xs: xs,
        md: md,
      }}
    >
      <TextField
        focused={focused}
        onClick={onClick}
        color={color}
        error={error}
        disabled={disable}
        value={field ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        variant={variant}
        onKeyDown={onKeyDown}
        fullWidth
        size={size}
        {...other}
      />
    </Grid2>
  );
}

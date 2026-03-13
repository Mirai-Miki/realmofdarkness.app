import { Select, InputLabel, FormControl, Grid2 } from "@mui/material";
import { useState, useEffect } from "react";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import { slugify } from "../../utility";

export default function ApiSelect(props) {
  const { label, value, slug, getOptions, xs } = props;
  const { lock, handleUpdate } = useSheetContext();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState(false);
  const [color, setColor] = useState("primary");

  async function onChange(event) {
    let newValue = event.target.value;
    setSelected(newValue);

    if (value === newValue) return;
    setColor("secondary");
    const name = slug ?? slugify(label);
    const updatedValue = newValue ?? "";
    const response = { [name]: updatedValue };

    const res = await handleUpdate(response);
    if (res === "error") {
      setError(true);
      setColor("primary");
      setTimeout(() => setError(false), 5000);
    } else {
      setColor("success");
      setTimeout(() => {
        setColor("primary");
      }, 2000);
    }
  }

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <Grid2
      size={{
        xs: xs ?? 12,
        md: "auto",
      }}
    >
      <FormControl fullWidth>
        <InputLabel id={`Selectselected-${label}`} size="small">
          {label}
        </InputLabel>
        <Select
          labelId={`Selectselected-${label}`}
          label={label}
          value={selected ?? ""}
          size="small"
          disabled={lock}
          onChange={onChange}
          color={color}
          error={error}
        >
          {getOptions()}
        </Select>
      </FormControl>
    </Grid2>
  );
}

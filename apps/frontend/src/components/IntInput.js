import { TextField } from "@mui/material";

export default function IntInput(props) {
  const { label, variant, onChange, error, value, required } = props;
  let { min, max } = props;

  if (isNaN(min)) min = Number.NEGATIVE_INFINITY;
  if (isNaN(max)) max = Number.POSITIVE_INFINITY;

  function checkInput(event) {
    let num = parseInt(event.target.value);
    const val = event.target.value;
    let err = error;

    if (isNaN(num) && val === "-") {
      err = true;
      num = val;
    } else if (val === "") {
      if (required) err = true;
      else if (err) err = false;
      num = "";
    } else if (isNaN(num)) {
      num = "";
    } else if (num > max || num < min) {
      err = true;
    } else {
      if (err) err = false;
    }

    onChange({ value: num, error: err });
  }

  return (
    <TextField
      label={label}
      variant={variant}
      onChange={checkInput}
      error={error}
      value={value}
    />
  );
}

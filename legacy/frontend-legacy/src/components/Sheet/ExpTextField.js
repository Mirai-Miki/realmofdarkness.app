//import { useSheetContext } from '../../routes/Character/Vampire5thSheet';
import { TextField, Grid2 } from "@mui/material";

export default function ExpTextField(props) {
  const { label, exp, xs } = props;
  //const { handleUpdate } = useSheetContext();

  const display = `${exp.current} / ${exp.total}`;

  return (
    <Grid2
      size={{
        xs: xs ?? 12,
        md: "auto",
      }}
    >
      <TextField
        disabled
        label={label}
        value={display}
        xs={xs}
        size="small"
        fullWidth
      />
    </Grid2>
  );
}

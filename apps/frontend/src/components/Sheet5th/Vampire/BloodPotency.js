import { Typography, Stack, Grid2 } from "@mui/material";
import RatingInfo from "../SheetRating";

export default function BloodPotency(props) {
  const { lock, potency, handleUpdate } = props;

  function onChange(event, value) {
    const updateValue = value ?? 0;
    handleUpdate({ blood_potency: updateValue });
  }

  return (
    <Stack
      direction={{ xl: "row", sm: "column", xs: "row" }}
      justifyContent="space-between"
      alignItems="center"
      padding={1}
      paddingTop={0}
    >
      <Grid2 paddingRight={1.5}>
        <Typography>Potency</Typography>
      </Grid2>
      <RatingInfo
        value={potency}
        locked={lock ?? false}
        onChange={onChange}
        max={10}
        size="medium"
      />
    </Stack>
  );
}

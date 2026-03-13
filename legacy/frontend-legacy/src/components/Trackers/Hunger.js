import { Typography, Rating, Grid2 } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";

export default function Hunger(props) {
  const { hunger, justifyContent, textAlign, readOnly } = props;
  const { handleUpdate } = useSheetContext();

  function handleChange(event, value) {
    handleUpdate({ hunger: value ?? 0 });
  }

  return (
    <Grid2
      container
      direction="column"
      justifyContent={justifyContent}
      alignItems={textAlign}
      textAlign={textAlign}
    >
      <Grid2 padding={0.6} size={12}>
        <Typography>Hunger</Typography>
      </Grid2>
      <Grid2
        container
        columnSpacing={1}
        direction="row"
        justifyContent={justifyContent}
        paddingBottom="5px"
      >
        <Rating
          name="Hunger"
          value={hunger}
          readOnly={readOnly}
          max={5}
          icon={<CircleIcon fontSize="inherit" />}
          emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
          size="small"
          sx={{ "& .MuiRating-iconFilled": { color: "#ab074e" } }}
          onChange={handleChange}
        />
      </Grid2>
    </Grid2>
  );
}

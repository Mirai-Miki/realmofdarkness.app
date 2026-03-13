import { Rating } from "@mui/material";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";

export default function SheetRating(props) {
  const {
    value,
    onChange,
    locked = false,
    hoverColor,
    filledColor,
    sx,
    max,
    size,
  } = props;

  return (
    <Rating
      readOnly={locked}
      max={max ?? 5}
      value={value}
      onChange={onChange}
      icon={<CircleIcon fontSize="inherit" />}
      emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
      size={size ?? "small"}
      sx={{
        ...sx,
        "& .MuiRating-iconFilled": { color: filledColor ?? "#ab074e" },
        "& .MuiRating-iconHover": { color: hoverColor ?? "#ff3d47" },
      }}
    />
  );
}

import { Typography, IconButton, Tooltip, Stack } from "@mui/material";
import RatingInfo from "./SheetRating";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { slugify } from "../../utility";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import { styled } from "@mui/system";
import SpecDialogue from "./SpecDialogue";
import { useState } from "react";

const CustomStack = styled(Stack)(({ theme }) => ({
  flexDirection: "row", // Default direction

  // Custom media query for a specific screen size
  [`@media (max-width: 1900px)`]: {
    flexDirection: "column", // Set custom direction at the specified screen size
  },

  // Custom media query for a specific screen size
  [`@media (max-width: 599px)`]: {
    flexDirection: "row", // Set custom direction at the specified screen size
  },

  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
}));

export default function Skill(props) {
  const { name, skill } = props;
  const { lock, sheet, handleUpdate } = useSheetContext();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogueOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogueClose = () => {
    setDialogOpen(false);
  };

  function onChange(event, value) {
    const updateValue = value ?? 0;
    const slug = slugify(name);
    const update = { [slug]: updateValue };

    const newSkills = JSON.parse(JSON.stringify(sheet.skills));
    newSkills[slug].value = updateValue;
    const sheetUpdate = { skills: newSkills };
    handleUpdate(update, sheetUpdate);
  }

  function onSpecChange(spec) {
    const sheetSlug = slugify(name);
    const slug = `${slugify(name)}_spec`;
    const update = { [slug]: spec };

    const newSkills = JSON.parse(JSON.stringify(sheet.skills));
    newSkills[sheetSlug].spec = spec;
    const sheetUpdate = { skills: newSkills };
    handleUpdate(update, sheetUpdate);
  }

  let specIcon;
  if (lock && skill.spec && skill.spec.length) {
    specIcon = (
      <Tooltip arrow title={skill.spec.join(", ")}>
        <ExpandCircleDownIcon
          fontSize="small"
          sx={{ marginLeft: 0.5, color: "#63199c" }}
        />
      </Tooltip>
    );
  } else if (lock) {
    specIcon = (
      <ExpandCircleDownIcon
        fontSize="small"
        sx={{ marginLeft: 0.5, color: "#3d3d3d" }}
      />
    );
  } else {
    const color = skill.spec && skill.spec.length ? "secondary" : "primary";
    specIcon = (
      <IconButton
        size="small"
        sx={{ paddingX: 0.3, paddingY: 0.2 }}
        onClick={handleDialogueOpen}
      >
        <AddCircleOutlineIcon fontSize="small" color={color} />
      </IconButton>
    );
  }

  return (
    <>
      <CustomStack
        direction={{ xl: "row", md: "column", xs: "row" }}
        justifyContent="space-between"
        alignItems="center"
        padding={1}
      >
        <Typography>{name}</Typography>
        <Stack direction="row">
          <RatingInfo
            value={skill.value}
            locked={lock ?? false}
            onChange={onChange}
          />
          {specIcon}
        </Stack>
      </CustomStack>
      <SpecDialogue
        name={name}
        spec={skill.spec ?? []}
        open={dialogOpen}
        onClose={handleDialogueClose}
        onSave={onSpecChange}
      />
    </>
  );
}

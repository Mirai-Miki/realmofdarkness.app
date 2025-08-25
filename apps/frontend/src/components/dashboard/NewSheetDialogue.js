import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Button,
  Divider,
  Stack,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { useAlertContext } from "../AlertProvider";

export default function NewSheetDialogue({ onClose, open }) {
  const [type, setType] = useState("v5");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pushAlert } = useAlertContext();

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    setError(value?.length < 1 || value?.length > 50);
  };

  const handleTypeChange = (event) => {
    if (event.target.value === type) setType(undefined);
    else setType(event.target.value);
  };

  const onCreateSheet = async () => {
    try {
      const response = await fetch(`/api/character/new/${type}?name=${name}`);
      if (!response.ok) {
        const data = await response.json();
        return pushAlert({ title: "API Error", message: data });
      }
      const data = await response.json();
      navigate(`/character/${type}/${data.id}`);
    } catch (error) {
      pushAlert({ title: "API Error", message: "Unknown Error" });
    }
  };

  // Card data arrays
  const fifthEditionCards = [
    { name: "Vampire", value: "v5", disabled: false },
    { name: "Hunter", value: "h5", disabled: true },
    { name: "Werewolf", value: "w5", disabled: true },
    { name: "Human", value: "human5", disabled: true },
    { name: "Ghoul", value: "ghoul5", disabled: true },
  ];

  const twentiethEditionCards = [
    { name: "Vampire", value: "v20", disabled: true },
    { name: "Werewolf", value: "w20", disabled: true },
    { name: "Mage", value: "m20", disabled: true },
    { name: "Changeling", value: "c20", disabled: true },
    { name: "Wraith", value: "wr20", disabled: true },
    { name: "Human", value: "human20", disabled: true },
    { name: "Ghoul", value: "ghoul20", disabled: true },
  ];

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          elevation: 8,
          sx: { borderRadius: "10px" },
        },
      }}
    >
      <DialogTitle color="primary" align="center">
        New Character Sheet
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Main container - horizontal on desktop, vertical on mobile */}
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          divider={
            <Divider
              orientation={isMobile ? "horizontal" : "vertical"}
              flexItem
            />
          }
        >
          {/* 5th Edition Section */}
          <EditionSection
            title="5th Edition"
            cards={fifthEditionCards}
            selectedType={type}
            onTypeChange={handleTypeChange}
          />

          {/* 20th Edition Section */}
          <EditionSection
            title="20th Edition"
            cards={twentiethEditionCards}
            selectedType={type}
            onTypeChange={handleTypeChange}
          />
        </Stack>

        {/* Character name and create button section */}
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          sx={{ mt: 4, mb: 2 }}
          justifyContent="center"
          alignItems="center"
        >
          <TextField
            label="Character Name"
            value={name}
            error={error}
            onChange={handleNameChange}
          />

          <Button
            disabled={!name || !type || error}
            size="large"
            variant="contained"
            endIcon={<SendIcon />}
            onClick={onCreateSheet}
          >
            Create
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// Edition section component (5th or 20th)
function EditionSection({ title, cards, selectedType, onTypeChange }) {
  return (
    <Stack spacing={2} flex={1}>
      <Typography variant="h6" align="center">
        {title}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 1,
        }}
      >
        {cards.map((card) => (
          <GameCard
            key={card.value}
            name={card.name}
            value={card.value}
            onClick={onTypeChange}
            selected={selectedType}
            disabled={card.disabled}
          />
        ))}
      </Box>
    </Stack>
  );
}

// Game card component
function GameCard({ name, value, onClick, selected, disabled }) {
  const color = selected === value ? "success" : "primary";

  return (
    <Button
      onClick={onClick}
      variant="outlined"
      value={value}
      color={color}
      fullWidth
      sx={{ textTransform: "capitalize" }}
      disabled={disabled}
    >
      {name}
    </Button>
  );
}

NewSheetDialogue.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ListSubheader,
  Container,
  OutlinedInput,
  Box,
  Chip,
  Alert,
  ListItemText,
  Grid2,
} from "@mui/material";
import { useState, useMemo } from "react";
import CharacterCard from "./CharacterCard";
import Checkbox from "@mui/material/Checkbox";
import DashboardControls from "../dashboard/DashboardControls";
import { useEffect } from "react";

export default function CharacterCardDisplay(props) {
  const { characters, chronicles, user } = props;

  const loadSortOptions = () => {
    const savedSortOptions = localStorage.getItem("dashboardSortOptions");
    return savedSortOptions
      ? JSON.parse(savedSortOptions)
      : {
          chronicle: "",
          splats: [],
          sortBy: "lastUpdated",
          storytellerMode: true,
        };
  };

  const [sortOptions, setSortOptions] = useState(loadSortOptions);

  useEffect(() => {
    localStorage.setItem("dashboardSortOptions", JSON.stringify(sortOptions));
  }, [sortOptions]);

  function handleSelectChange(event, value) {
    const newSort = { ...sortOptions };
    newSort[value] = event.target.value;
    setSortOptions(newSort);
  }

  function handleStorytellerMode(event) {
    const newSort = { ...sortOptions };
    newSort.storytellerMode = !newSort.storytellerMode;
    setSortOptions(newSort);
  }

  function handleSplatChange(event) {
    const {
      target: { value },
    } = event;
    const newSort = { ...sortOptions };

    if (value.includes("all")) {
      newSort.splats = [];
    } else
      newSort.splats = typeof value === "string" ? value.split(",") : value;
    setSortOptions(newSort);
  }

  function onCloseSelect() {
    setTimeout(() => {
      document.activeElement.blur();
    }, 0);
  }

  function chronicleMenus() {
    const menu = [
      <MenuItem key="all" value="">
        All
      </MenuItem>,
      <MenuItem key="0" value="0">
        No Server
      </MenuItem>,
    ];
    for (const chronicle of Object.values(chronicles)) {
      menu.push(
        <MenuItem key={chronicle.id} value={chronicle.id}>
          {chronicle.name}
        </MenuItem>
      );
    }
    return menu;
  }

  function renderCharacterCards() {
    if (!characters) return;
    let cards = [];

    // Sorting by last updated time
    const sortedChars = Object.values(characters).sort((a, b) => {
      if (sortOptions.sortBy === "lastUpdated") {
        return b.last_updated - a.last_updated;
      }
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      return nameA.localeCompare(nameB);
    });

    for (const character of sortedChars) {
      if (
        sortOptions.chronicle !== "" &&
        sortOptions.chronicle !== "0" &&
        character.chronicle !== sortOptions.chronicle
      ) {
        continue;
      } else if (
        character.chronicle !== null &&
        character.chronicle !== "" &&
        sortOptions.chronicle === "0"
      ) {
        continue;
      } else if (
        sortOptions.splats.length &&
        !sortOptions.splats.includes(character.splat)
      ) {
        continue;
      } else if (character.user !== user.id && !sortOptions.storytellerMode) {
        continue;
      }
      cards.push(<CharacterCard key={character.id} character={character} />);
    }
    const noChars = (
      <Alert severity="warning" variant="outlined" sx={{ mt: 5 }}>
        No Characters were found!
      </Alert>
    );
    return (
      <Grid2
        container
        justifyContent="center"
        alignItems="flex-start"
        columnSpacing={3}
        rowSpacing={3}
        paddingBottom={3}
      >
        {cards.length ? cards : noChars}
      </Grid2>
    );
  }

  const getSplatMenus = useMemo(
    () => renderSplatSelectFilter(characters, sortOptions.splats),
    [characters, sortOptions.splats]
  );

  return (
    <Container maxWidth="xl">
      {/* Filter Controls Section */}
      <Grid2
        container
        direction="row"
        justifyContent="center"
        rowSpacing={3}
        columnSpacing={2}
        sx={{ mb: 3 }}
      >
        <Grid2>
          <FormControl sx={{ minWidth: "150px" }}>
            <InputLabel id="chronicle-select-label">Chronicles</InputLabel>
            <Select
              labelId="chronicle-select-label"
              id="chronicle-select"
              label="Chronicles"
              value={sortOptions.chronicle}
              onChange={(event) => {
                handleSelectChange(event, "chronicle");
              }}
              onClose={onCloseSelect}
            >
              {chronicleMenus()}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2>
          <FormControl sx={{ minWidth: "150px" }}>
            <InputLabel id="splat-select-label">Splats</InputLabel>
            <Select
              labelId="splat-select-label"
              id="splat-select"
              label="Splats"
              multiple
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              value={sortOptions.splats}
              onChange={handleSplatChange}
              onClose={onCloseSelect}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {getSplatMenus}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2>
          <FormControl sx={{ minWidth: "150px" }}>
            <InputLabel id="sortBy-select-label">Sort by</InputLabel>
            <Select
              labelId="sortBy-select-label"
              id="sortBy-select"
              label="Sort by"
              value={sortOptions.sortBy}
              onChange={(event) => {
                handleSelectChange(event, "sortBy");
              }}
            >
              <MenuItem value="lastUpdated">Last Updated</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <DashboardControls
          sortOptions={sortOptions}
          handleStorytellerMode={handleStorytellerMode}
        />
      </Grid2>

      {/* Character Cards Section - Always on a new line */}
      {renderCharacterCards()}
    </Container>
  );
}

function renderSplatSelectFilter(characters, splats) {
  let v5;
  let v20;
  const tempV5 = {};
  const tempV20 = {};

  // Skip processing if characters is undefined or empty
  if (!characters) return [];

  for (const character of Object.values(characters)) {
    // Make sure character has a valid splat that exists in SplatLabels
    if (character.splat && SplatLabels[character.splat]) {
      const splat = SplatLabels[character.splat];
      if (splat.version === "5th") tempV5[splat.key] = splat;
      else tempV20[splat.key] = splat;
    }
    // Skip characters with invalid splat values (no warning needed to avoid console spam)
  }

  v5 = Object.values(tempV5);
  v20 = Object.values(tempV20);

  const menu = [
    <MenuItem key="all" value="all">
      Clear Filter
    </MenuItem>,
  ];

  if (v5.length) {
    menu.push(<ListSubheader key="5th">5th Edition</ListSubheader>);
    v5.sort((a, b) => a.order - b.order);
  }

  for (const splat of v5) {
    menu.push(
      <MenuItem key={splat.key} value={splat.key}>
        <Checkbox checked={splats.indexOf(splat.key) > -1} />
        <ListItemText>{splat.name}</ListItemText>
      </MenuItem>
    );
  }

  if (v20.length) {
    menu.push(<ListSubheader key="20th">20th Edition</ListSubheader>);
    v20.sort((a, b) => a.order - b.order);
  }

  for (const splat of v20) {
    menu.push(
      <MenuItem key={splat.key} value={splat.key}>
        <Checkbox checked={splats.indexOf(splat.key) > -1} />
        <ListItemText>{splat.name}</ListItemText>
      </MenuItem>
    );
  }
  return menu;
}

const SplatLabels = {
  vampire5th: {
    key: "vampire5th",
    name: "Vampire",
    version: "5th",
    order: "1",
  },
  hunter5th: {
    key: "hunter5th",
    name: "Hunter",
    version: "5th",
    order: "2",
  },
  werewolf5th: {
    key: "werewolf5th",
    name: "Werewolf",
    version: "5th",
    order: "3",
  },
  human5th: {
    key: "human5th",
    name: "Human",
    version: "5th",
    order: "4",
  },
  ghoul5th: {
    key: "ghoul5th",
    name: "Ghoul",
    version: "5th",
    order: "5",
  },
  vampire20th: {
    key: "vampire20th",
    name: "Vampire",
    version: "20th",
    order: "1",
  },
  human20th: {
    key: "human20th",
    name: "Human",
    version: "20th",
    order: "2",
  },
  ghoul20th: {
    key: "ghoul20th",
    name: "Ghouls",
    version: "20th",
    order: "3",
  },
  werewolf20th: {
    key: "werewolf20th",
    name: "Werewolf",
    version: "20th",
    order: "4",
  },
  mage20th: {
    key: "mage20th",
    name: "Mage",
    version: "20th",
    order: "5",
  },
  changeling20th: {
    key: "changeling20th",
    name: "Changeling",
    version: "20th",
    order: "6",
  },
  wraith20th: {
    key: "wraith20th",
    name: "Wraith",
    version: "20th",
    order: "7",
  },
  demon20th: {
    key: "demon20th",
    name: "Demon",
    version: "20th",
    order: "8",
  },
};

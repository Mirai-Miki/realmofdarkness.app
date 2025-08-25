import { Button, IconButton, Tooltip, Grid2 } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ApiTextField from "../Sheet/ApiTextField";
import Header from "../Sheet/Header";
import { useState } from "react";
import TableChartIcon from "@mui/icons-material/TableChart";

import { useSheetContext } from "../../routes/Character/Vampire5thSheet";
import ExpChart from "./Vampire/ExpChart";

export default function ExpTab() {
  const { lock, sheet, handleUpdate } = useSheetContext();

  const [exp_spends, setSpends] = useState(sheet.exp_spends);
  const [chartOpen, setChartOpen] = useState(false);

  async function update(change) {
    const key = Object.keys(change)[0];
    const index =
      key.match(/\d+/)[0] === "0" ? 0 : parseInt(key.match(/\d+/)[0]);
    const type = key.match(/_\w+/)[0].replace(/_/, "");

    let description;
    let cost;

    if (type === "description") {
      description = change[key];
      cost = exp_spends[index].cost;
    } else {
      const c = change[key] === "0" ? 0 : parseInt(change[key]);
      if (c === Number.isNaN()) cost = NaN;
      else {
        cost = c;
        let current;
        let diff;
        if (c < sheet.exp_spends[index].cost) {
          diff = sheet.exp_spends[index].cost - c;
          current = sheet.exp.current + diff;
          if (current > sheet.exp.total) current = sheet.exp.total;
        } else {
          diff = sheet.exp_spends[index].cost - c;
          current = sheet.exp.current + diff;
          if (current < 0) current = 0;
        }
        await handleUpdate({ exp_current: current });
      }
      description = exp_spends[index].description;
    }

    const spends = [];
    for (let i = 0; i < exp_spends.length; i++) {
      if (i === index) {
        spends.push({ description, cost });
      } else
        spends.push({
          description: exp_spends[i].description,
          cost: parseInt(exp_spends[i].cost),
        });
    }

    setSpends(spends);
    const res = await handleUpdate({ exp_spends: spends });
    if (res === "error") setSpends(sheet.exp_spends);
  }

  const renderSpends = () => {
    if (lock)
      return exp_spends.map((item, index) => (
        <Grid2
          container
          key={index}
          paddingX={1}
          spacing={2}
          size={{
            xs: 12,
            xl: 6,
          }}
        >
          <Grid2
            size={{
              xs: 9,
              lg: 10,
            }}
          >
            <ApiTextField
              slug={`${index}_description`}
              value={item.description}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 3,
              lg: 2,
            }}
          >
            <ApiTextField
              label="Cost"
              slug={`${index}_cost`}
              value={item.cost}
            />
          </Grid2>
        </Grid2>
      ));
    else
      return exp_spends.map((item, index) => (
        <Grid2
          container
          key={index}
          spacing={2}
          size={{
            xs: 12,
            xl: 6,
          }}
        >
          <Grid2
            size={{
              xs: 8,
              lg: 9,
            }}
          >
            <ApiTextField
              slug={`${index}_description`}
              save={update}
              value={item.description}
              maxLength={200}
            />
          </Grid2>
          <Grid2
            size={{
              xs: 3,
              lg: 2,
            }}
          >
            <ApiTextField
              label="Cost"
              slug={`${index}_cost`}
              save={update}
              value={item.cost}
              maxLength={10}
            />
          </Grid2>
          <Grid2 size={1}>
            <IconButton color="error" onClick={() => handleDeleteRow(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid2>
        </Grid2>
      ));
  };

  function handleAddRow() {
    const newSpends = [];
    for (const item of exp_spends) {
      newSpends.push(item);
    }

    newSpends.push({
      description: "",
      cost: 0,
    });
    setSpends(newSpends);
  }

  async function handleDeleteRow(index) {
    const newSpends = [];
    for (let i = 0; i < exp_spends.length; i++) {
      if (index !== i) newSpends.push(exp_spends[i]);
    }
    const res = await handleUpdate({ exp_spends: newSpends });
    if (res !== "error") {
      setSpends(newSpends);
    }
  }

  const renderAddSpendButton = () => {
    if (lock) return null;
    else
      return (
        <Grid2 sx={12} paddingTop={2}>
          <Button variant="outlined" onClick={handleAddRow}>
            Add Spend
          </Button>
        </Grid2>
      );
  };

  const renderExpChat = () => {
    if (!chartOpen) return null;
    return (
      <Grid2
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        size={12}
      >
        <Header padding={2}>Exp Cost Chart</Header>
        <ExpChart />
      </Grid2>
    );
  };

  return (
    <Grid2 spacing={0} container size={12} paddingBottom={2}>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        size={12}
      >
        <Grid2
          container
          justifyContent="center"
          paddingTop={2}
          size={12}
          spacing={2}
        >
          <ApiTextField
            label="Exp Current"
            slug="exp_current"
            value={sheet.exp.current}
            xs={6}
          />
          <ApiTextField
            label="Exp Total"
            slug="exp_total"
            value={sheet.exp.total}
            xs={6}
          />
          <Grid2>
            <Tooltip title="Experiance Cost Chart">
              <IconButton onClick={() => setChartOpen(!chartOpen)}>
                <TableChartIcon color={chartOpen ? "info" : "secondary"} />
              </IconButton>
            </Tooltip>
          </Grid2>
        </Grid2>
        <Header padding={2}>Spends</Header>
        <Grid2 container justifyContent="flex-start" rowSpacing={2} size={12}>
          {renderSpends()}
        </Grid2>
        {renderAddSpendButton()}
        {renderExpChat()}
      </Grid2>
    </Grid2>
  );
}

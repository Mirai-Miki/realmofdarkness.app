import { IconButton, Typography, Paper, Tooltip, Grid2 } from "@mui/material";
import V5DamageTracker from "../../Trackers/V5DamageTracker";
import { useSheetContext } from "../../../routes/Character/Vampire5thSheet";
import { useState } from "react";

import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { slugify } from "../../../utility";
import V5Humanity from "../../Trackers/V5Humanity";
import Hunger from "../../Trackers/Hunger";
import { useClientContext } from "../../ClientProvider";

export default function Tracker(props) {
  const { sheet } = useSheetContext();
  const { user } = useClientContext();
  const [damagePanel, setDamagePanel] = useState(false);
  const [humanityPanel, setHumanityPanel] = useState(false);

  function handleOpenDamagePanel(label) {
    if (humanityPanel) setHumanityPanel(false);
    setDamagePanel((prev) => (prev === label ? null : label));
  }

  function handleOpenHumanityPanel() {
    if (damagePanel) setDamagePanel(false);
    setHumanityPanel(!humanityPanel);
  }

  return (
    <>
      <Grid2
        container
        paddingLeft={3}
        rowGap={3}
        columnGap={2}
        justifyContent="space-around"
        alignItems="center"
        marginBottom={damagePanel || humanityPanel ? 0 : 3}
      >
        <V5DamageTracker
          label="Willpower"
          textAlign="center"
          justifyContent="center"
          tracker={sheet.willpower}
          onOpen={handleOpenDamagePanel}
          open={damagePanel}
          readOnly={sheet.user !== user.id}
        />
        <V5DamageTracker
          label="Health"
          textAlign="center"
          justifyContent="center"
          tracker={sheet.health}
          onOpen={handleOpenDamagePanel}
          open={damagePanel}
          readOnly={sheet.user !== user.id}
        />
        <V5Humanity
          humanity={sheet.humanity}
          stains={sheet.stains}
          justifyContent="center"
          textAlign="center"
          open={humanityPanel}
          onOpen={handleOpenHumanityPanel}
          readOnly={sheet.user !== user.id}
        />
        <Hunger
          hunger={sheet.hunger}
          justifyContent="center"
          textAlign="center"
          readOnly={sheet.user !== user.id}
        />
      </Grid2>
      {damagePanel ? <DamagePanel label={damagePanel} /> : ""}
      {humanityPanel ? <HumanityPanel /> : ""}
    </>
  );
}

function HumanityPanel(props) {
  const { sheet, handleUpdate } = useSheetContext();

  function handleChangeDamage(event, amount) {
    const value = event.currentTarget.value;
    let tracker;
    try {
      tracker = new HumanityTracker(value, sheet, amount);
    } catch (error) {
      return;
    } // Do nothing
    handleUpdate(tracker.toUpdate());
  }

  return (
    <Grid2
      container
      alignItems="center"
      justifyContent="center"
      paddingBottom={2}
    >
      <Paper sx={{ borderRadius: "10px" }}>
        <Grid2
          container
          justifyContent="center"
          textAlign="center"
          columnGap={8}
        >
          <Grid2
            size={{
              xs: 12,
              md: "auto",
            }}
          >
            <Tooltip arrow title="Remove Humanity">
              <IconButton
                value="humanity"
                onClick={(e) => handleChangeDamage(e, -1)}
              >
                <RemoveCircleOutlineIcon style={{ color: "#ac3757" }} />
              </IconButton>
            </Tooltip>
            Total
            <Tooltip arrow title="Add Humanity">
              <IconButton
                value="humanity"
                onClick={(e) => handleChangeDamage(e, 1)}
              >
                <AddCircleOutlineOutlinedIcon style={{ color: "#ab0934" }} />
              </IconButton>
            </Tooltip>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: "auto",
            }}
          >
            <Typography color="primary" paddingTop={{ xs: 0, md: 1 }}>
              Humanity
            </Typography>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: "auto",
            }}
          >
            <Tooltip arrow title="Remove Stain">
              <IconButton
                value="stains"
                onClick={(e) => handleChangeDamage(e, -1)}
              >
                <RemoveCircleOutlineIcon style={{ color: "#cca454" }} />
              </IconButton>
            </Tooltip>
            Stains
            <Tooltip arrow title="Take Stain">
              <IconButton
                value="stains"
                onClick={(e) => handleChangeDamage(e, 1)}
              >
                <AddCircleOutlineOutlinedIcon style={{ color: "#cf9013" }} />
              </IconButton>
            </Tooltip>
          </Grid2>
        </Grid2>
      </Paper>
    </Grid2>
  );
}

class HumanityTracker {
  constructor(changed, sheet, amount) {
    this.sheet = sheet;
    this.amount = amount;
    this.humanity = null;
    this.stains = null;

    if (changed === "humanity") this.updateHumanity();
    else this.updateStains();
  }

  updateHumanity() {
    const change = this.sheet.humanity + this.amount;
    if (change < 0 || change > 10) throw new Error();

    if (10 - change < this.sheet.stains) this.stains = 10 - change;
    this.humanity = change;
  }

  updateStains() {
    this.stains = this.sheet.stains + this.amount;
    if (
      this.stains < 0 ||
      this.stains > 10 ||
      this.stains > 10 - this.sheet.humanity
    )
      throw new Error();
  }

  toUpdate() {
    const update = {};
    if (this.humanity != null) update.humanity = this.humanity;
    if (this.stains != null) update.stains = this.stains;
    return update;
  }
}

function DamagePanel(props) {
  const { label } = props;
  const slug = slugify(label);
  const { sheet, lock, handleUpdate } = useSheetContext();

  function handleChangeDamage(event, amount) {
    const value = event.currentTarget.value;
    let tracker;
    try {
      tracker = new DamageTracker(slug, sheet[slug], value, amount);
    } catch (error) {
      return;
    } // Do nothing
    handleUpdate(tracker.toUpdate(), tracker.toSheetUpdate());
  }

  const unlocked = (
    <>
      <Grid2
        size={{
          xs: 12,
          md: "auto",
        }}
      >
        <Tooltip arrow title="Remove Aggravated Damage">
          <IconButton
            value="aggravated"
            onClick={(e) => handleChangeDamage(e, -1)}
          >
            <RemoveCircleOutlineIcon style={{ color: "#ac3757" }} />
          </IconButton>
        </Tooltip>
        Aggravated Damage
        <Tooltip arrow title="Take Aggravated Damage">
          <IconButton
            value="aggravated"
            onClick={(e) => handleChangeDamage(e, 1)}
          >
            <AddCircleOutlineOutlinedIcon style={{ color: "#ab0934" }} />
          </IconButton>
        </Tooltip>
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          md: "auto",
        }}
      >
        <Typography color="primary" paddingTop={{ xs: 0, md: 1 }}>
          {label}
        </Typography>
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          md: "auto",
        }}
      >
        <Tooltip arrow title="Remove Superficial Damage">
          <IconButton
            value="superficial"
            onClick={(e) => handleChangeDamage(e, -1)}
          >
            <RemoveCircleOutlineIcon style={{ color: "#cca454" }} />
          </IconButton>
        </Tooltip>
        Superficial Damage
        <Tooltip arrow title="Take Superficial Damage">
          <IconButton
            value="superficial"
            onClick={(e) => handleChangeDamage(e, 1)}
          >
            <AddCircleOutlineOutlinedIcon style={{ color: "#cf9013" }} />
          </IconButton>
        </Tooltip>
      </Grid2>
    </>
  );

  const locked = (
    <>
      <Grid2>
        <Tooltip arrow title={`Remove ${label}`}>
          <IconButton value="total" onClick={(e) => handleChangeDamage(e, -1)}>
            <RemoveCircleOutlineIcon style={{ color: "#ac3757" }} />
          </IconButton>
        </Tooltip>
      </Grid2>
      <Grid2>
        <Typography color="primary" paddingTop={1}>
          {label}
        </Typography>
      </Grid2>
      <Grid2>
        <Tooltip arrow title={`Add ${label}`}>
          <IconButton value="total" onClick={(e) => handleChangeDamage(e, 1)}>
            <AddCircleOutlineOutlinedIcon style={{ color: "#ab0934" }} />
          </IconButton>
        </Tooltip>
      </Grid2>
    </>
  );

  return (
    <Grid2
      container
      alignItems="center"
      justifyContent="center"
      paddingBottom={2}
    >
      <Paper sx={{ borderRadius: "10px" }}>
        <Grid2
          container
          justifyContent="center"
          textAlign="center"
          columnGap={lock ? 8 : 2}
        >
          {lock ? unlocked : locked}
        </Grid2>
      </Paper>
    </Grid2>
  );
}

class DamageTracker {
  constructor(name, sheetTracker, changedValue, amount) {
    this.name = name;
    this.tracker = { ...sheetTracker };
    this.amount = amount;
    this.total = null;
    this.superficial = null;
    this.aggravated = null;

    if (changedValue === "total") this.updateTotal();
    else this.updateDamage(changedValue);
  }

  updateDamage(name) {
    let current = name;
    let other = name === "superficial" ? "aggravated" : "superficial";
    let change = this.tracker[current] + this.amount;

    if (change < 0 || change > 20) throw new Error();

    if (change + this.tracker[other] > this.tracker.total) {
      this.aggravated = this.tracker.aggravated + 1;
      this.superficial = this.tracker.superficial - 1;
      if (this.superficial < 0) this.superficial = 0;
      if (this.aggravated + this.superficial > this.tracker.total)
        throw new Error();
    } else this[current] = change;
  }

  updateTotal() {
    let change = this.tracker.total + this.amount;

    if (this.name === "willpower" && (change < 1 || change > 15))
      throw new Error();
    else if (change < 1 || change > 20) throw new Error();

    if (this.tracker.superficial + this.tracker.aggravated > change) {
      if (this.tracker.superficial)
        this.superficial = this.tracker.superficial - 1;
      else if (this.tracker.aggravated)
        this.aggravated = this.tracker.aggravated - 1;
    }
    this.total = change;
  }

  toUpdate() {
    const update = {};
    if (this.superficial != null)
      update[`${this.name}_superficial`] = this.superficial;
    if (this.aggravated != null)
      update[`${this.name}_aggravated`] = this.aggravated;
    if (this.total != null) update[`${this.name}_total`] = this.total;
    return update;
  }

  toSheetUpdate() {
    const sheetUpdate = {
      superficial:
        this.superficial != null ? this.superficial : this.tracker.superficial,
      aggravated:
        this.aggravated != null ? this.aggravated : this.tracker.aggravated,
      total: this.total != null ? this.total : this.tracker.total,
    };
    return { [this.name]: sheetUpdate };
  }
}

import { Grid2, Typography, Button, Divider, Container } from "@mui/material";
import { Link } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import IntInput from "../../components/IntInput";

function roll() {
  return Math.floor(Math.random() * 10) + 1;
}

function toFixed(num, fixed) {
  // eslint-disable-next-line
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)[0];
}

function toPercent(num, rolls) {
  return toFixed((num / rolls) * 100, 2) + "%";
}

export default function V5Dice() {
  const [pool, setPool] = useState({ value: 1, error: false });
  const [hunger, setHunger] = useState({ value: "", error: false });
  const [difficulty, setDifficulty] = useState({ value: "", error: false });
  const [results, setResults] = useState({
    totalFail: 0,
    fail: 0,
    bestialFail: 0,
    pass: 0,
    crit: 0,
    messyCrit: 0,
    highest: 0,
    average: 0,
  });

  async function calculateResults(values) {
    let { pool, hunger, difficulty } = values;
    const result = {
      totalFail: 0,
      fail: 0,
      bestialFail: 0,
      pass: 0,
      crit: 0,
      messyCrit: 0,
      highest: 0,
      average: 0,
      failChance: 0,
      passChance: 0,
    };
    if (!hunger) hunger = 0;
    if (!difficulty) difficulty = 1;

    let blackPool = pool - hunger;
    if (blackPool < 0) blackPool = 0;
    let redPool = hunger;
    if (pool < hunger) redPool = pool;
    const rolls = 1000000;
    let total = 0;

    result.highest = pool + (pool % 2 ? pool - 1 : pool);

    for (let i = 0; i < rolls; i++) {
      let tens = 0;
      let crit = 0;
      let bestial = false;
      let messy = false;
      let sux = 0;

      for (let i = 0; i < blackPool; i++) {
        const dice = roll();
        if (dice === 10) {
          tens++;
          sux++;
        } else if (dice >= 6) sux++;
      }

      for (let i = 0; i < redPool; i++) {
        const dice = roll();
        if (dice === 10) {
          tens++;
          sux++;
          messy = true;
        } else if (dice === 1) {
          bestial = true;
        } else if (dice >= 6) sux++;
      }

      crit = tens % 2 ? tens - 1 : tens;
      sux += crit;
      total += sux;

      if (sux < difficulty && bestial) result.bestialFail++;
      else if (sux === 0) result.totalFail++;
      else if (sux < difficulty) result.fail++;
      else if (crit) {
        if (messy) result.messyCrit++;
        else result.crit++;
      } else result.pass++;
    }

    const passChance = result.pass + result.crit + result.messyCrit;
    const failChance = result.totalFail + result.fail + result.bestialFail;

    result.passChance = toPercent(passChance, rolls);
    result.failChance = toPercent(failChance, rolls);
    result.average = toFixed(total / rolls, 2);
    result.totalFail = toPercent(result.totalFail, rolls);
    result.bestialFail = toPercent(result.bestialFail, rolls);
    result.fail = toPercent(result.fail, rolls);
    result.pass = toPercent(result.pass, rolls);
    result.crit = toPercent(result.crit, rolls);
    result.messyCrit = toPercent(result.messyCrit, rolls);

    setResults(result);
  }

  return (
    <Container sx={{ my: 13 }}>
      <Grid2
        container
        spacing={4}
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid2
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
          rowSpacing={3}
          columnSpacing={3}
          size={12}
        >
          <Grid2 sx={{ textAlign: "center" }} size={12}>
            <Typography variant="h3" component="h1" color="primary">
              Dice Probability
            </Typography>
          </Grid2>
          <Grid2 size="grow">
            <IntInput
              label="Pool"
              variant="filled"
              min={1}
              max={50}
              value={pool.value}
              error={pool.error}
              required
              onChange={(event) => setPool(event)}
            />
          </Grid2>
          <Grid2 size="grow">
            <IntInput
              label="Hunger"
              variant="filled"
              min={0}
              max={5}
              value={hunger.value}
              error={hunger.error}
              onChange={(event) => setHunger(event)}
            />
          </Grid2>
          <Grid2 size="grow">
            <IntInput
              label="Difficulty"
              variant="filled"
              min={0}
              max={50}
              value={difficulty.value}
              error={difficulty.error}
              onChange={(event) => setDifficulty(event)}
            />
          </Grid2>
          <Grid2
            sx={{ textAlign: "center" }}
            size={{
              xs: 12,
              md: 2,
            }}
          >
            <Button
              variant="contained"
              disabled={pool.error || hunger.error || difficulty.error}
              endIcon={<SendIcon />}
              onClick={() => {
                calculateResults({
                  pool: pool.value,
                  hunger: hunger.value,
                  difficulty: difficulty.value,
                });
              }}
            >
              Calulate
            </Button>
          </Grid2>
          <Grid2 container columnSpacing={3} rowSpacing={2} size={12}>
            <Grid2 sx={{ textAlign: "center" }} size={6}>
              <Typography
                variant="h4"
                component="h2"
                color="primary"
                sx={{ pb: 1 }}
              >
                Pass Chance: {results.passChance}
              </Typography>
              <Divider />
              <Typography sx={{ pt: 1 }}>Pass: {results.pass}</Typography>
              <Typography>Critical: {results.crit}</Typography>
              <Typography>Messy Critical: {results.messyCrit}</Typography>
            </Grid2>
            <Grid2 sx={{ textAlign: "center" }} size={6}>
              <Typography
                variant="h4"
                component="h2"
                color="primary"
                sx={{ pb: 1 }}
              >
                Fail Chance: {results.failChance}
              </Typography>
              <Divider />
              <Typography sx={{ pt: 1 }}>
                Bestial Fail: {results.bestialFail}
              </Typography>
              <Typography>Total Fail: {results.totalFail}</Typography>
              <Typography>Fail: {results.fail}</Typography>
            </Grid2>
            <Grid2 sx={{ textAlign: "center" }} size={12}>
              <Typography>
                Highest Possible Success: {results.highest}
              </Typography>
              <Typography>
                Average Successes Rolled: {results.average}
              </Typography>
            </Grid2>
          </Grid2>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to="../"
            size="large"
            sx={{ width: "100%", height: 60 }}
          >
            Home
          </Button>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Button
            color="primary"
            variant="outlined"
            size="large"
            href="https://discord.com/oauth2/authorize?client_id=814857851406647309&scope=bot%20applications.commands&permissions=278528"
            target="_blank"
            sx={{ width: "100%", height: 60 }}
          >
            Bot Invite Link
          </Button>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Button
            color="primary"
            variant="outlined"
            href="https://v5.realmofdarkness.app/"
            size="large"
            sx={{ width: "100%", height: 60 }}
          >
            Bot Command Docs
          </Button>
        </Grid2>
        <Grid2 size={12}>
          <Typography color="secondary">
            * This algorithm rolls 1 million times to work out the probability
            of rolls. Each calculation will be slightly different.
          </Typography>
        </Grid2>
      </Grid2>
    </Container>
  );
}

import { CircularProgress, Container, Typography, Grid2 } from "@mui/material";
import { useState, useEffect } from "react";

export default function Connecting(props) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots === "..." ? "." : prevDots + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        paddingTop={15}
      >
        <Grid2 minWidth="136px">
          <Typography variant="h6" color="textSecondary">
            Connecting{dots}
          </Typography>
        </Grid2>
        <Grid2>
          <CircularProgress />
        </Grid2>
      </Grid2>
    </Container>
  );
}

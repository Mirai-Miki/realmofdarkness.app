import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function CoD() {
  return (
    <Container sx={{ my: 13 }}>
      <Outlet />
    </Container>
  );
}

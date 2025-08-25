import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function Twentieth() {
  return (
    <Container sx={{ my: 13 }}>
      <Outlet />
    </Container>
  );
}

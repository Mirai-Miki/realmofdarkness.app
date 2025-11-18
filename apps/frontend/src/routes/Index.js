import WelcomePage from "../components/WelcomePage";
import { useClientContext } from "../components/ClientProvider";
import Dashboard from "../components/dashboard/Dashboard";
import { Container } from "@mui/material";

export default function Index() {
  const { user } = useClientContext();

  let render = (
    <Container sx={{ my: 13 }}>
      <WelcomePage />
    </Container>
  );
  if (user) render = <Dashboard />;

  return <>{render}</>;
}

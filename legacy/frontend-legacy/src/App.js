import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Container } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import darkScrollbar from "@mui/material/darkScrollbar";
import Layout from "./routes/Layout";
import Index from "./routes/Index";
import V20Commands from "./routes/20th/20thCommands";
import Twentieth from "./routes/20th/20th";
import CoD from "./routes/CoD/CoD";
import { useLayoutEffect } from "react";
import TwentiethIndex from "./routes/20th/20thIndex";
import CodIndex from "./routes/CoD/CodIndex";
import CodCommands from "./routes/CoD/CodCommands";
import Vampire5thSheet from "./routes/Character/Vampire5thSheet";
import Character from "./routes/Character/Character";
//import initAnalytics from "./functions/initAnalytics";
import V5Dice from "./routes/v5/V5Dice";
import ClientProvider from "./components/ClientProvider";
import AlertProvider from "./components/AlertProvider";

const darkTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...darkScrollbar(),
          backgroundColor: "#0a070a",
          backgroundImage: `linear-gradient(360deg, #0a070a 40%, 80%, #190821 95%)`,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiListSubheader: {
      defaultProps: {
        color: "primary",
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#d8bf31",
    },
    secondary: {
      main: "#c089fa",
    },
    background: {
      default: "#0a070a",
    },
    error: {
      main: "#ef2056",
    },
    warning: {
      main: "#e45f15",
    },
    success: {
      main: "#5ee28a",
    },
  },
});

function ScrollToTop({ children }) {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return children;
}

function App() {
  //initAnalytics()
  return (
    <ClientProvider>
      <ThemeProvider theme={darkTheme}>
        <AlertProvider>
          <CssBaseline enableColorScheme />
          <BrowserRouter>
            <ScrollToTop>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="v5/dice" element={<V5Dice />} />
                  <Route path="20th" element={<Twentieth />}>
                    <Route index element={<TwentiethIndex />} />
                    <Route path="commands" element={<V20Commands />} />
                  </Route>
                  <Route path="cod" element={<CoD />}>
                    <Route index element={<CodIndex />} />
                    <Route path="commands" element={<CodCommands />} />
                  </Route>
                  <Route path="character" element={<Character />}>
                    <Route index element={<NotFound />} />
                    <Route path="v5/:id" element={<Vampire5thSheet />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ScrollToTop>
          </BrowserRouter>
        </AlertProvider>
      </ThemeProvider>
    </ClientProvider>
  );
}

export default App;

function NotFound(props) {
  return (
    <Container sx={{ my: 13 }}>
      <h1>Sorry, no page here</h1>
    </Container>
  );
}

import { Tab, Tabs, Box, useMediaQuery, Grid2 } from "@mui/material";
import DisciplinesTab from "../DisciplinesTab";
import BloodPotencyTab from "./BloodPotencyTab";
import HuntingTab from "./HuntingTab";
import ProfileTab from "../ProfileTab";
import ExpTab from "../ExpTab";
import BeliefsTab from "./BeliefsTab";
import NotesTab from "../../Sheet/NotesTab";
import AdvantagesTab from "../AdvantagesTab";

import { useState } from "react";
import HavenTab from "../HavenTab";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
}

export default function SheetNav(props) {
  const [value, setValue] = useState(0);
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("xl"));

  const centered = isSmallScreen ? false : true;
  const scrollable = isSmallScreen ? "scrollable" : "standard";

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Grid2 size={12}>
        <Box
          sx={{
            borderRadius: "20px",
            maxWidth: "100%",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={value}
            textColor="secondary"
            indicatorColor="secondary"
            variant={scrollable}
            centered={centered}
            scrollButtons
            onChange={handleChange}
          >
            <Tab label="Core" value={0} />
            <Tab label="Beliefs" value={1} />
            <Tab label="Advantages" value={2} />
            <Tab label="Haven" value={3} />
            <Tab label="Exp" value={4} />
            <Tab label="Profile" value={5} />
            <Tab label="Notes" value={6} />
            <Tab label="Gallery" value={7} disabled />
          </Tabs>
        </Box>
      </Grid2>
      {/* Core Tab */}
      <CustomTabPanel value={value} index={0}>
        <DisciplinesTab />
        <Grid2 container paddingTop={2}>
          <BloodPotencyTab />
          <HuntingTab />
        </Grid2>
      </CustomTabPanel>
      {/* Beliefs Tab */}
      <CustomTabPanel value={value} index={1}>
        <BeliefsTab />
      </CustomTabPanel>
      {/* Advantages Tab */}
      <CustomTabPanel value={value} index={2}>
        <AdvantagesTab />
      </CustomTabPanel>
      {/* Haven Tab */}
      <CustomTabPanel value={value} index={3}>
        <HavenTab />
      </CustomTabPanel>
      {/* Exp Tab */}
      <CustomTabPanel value={value} index={4}>
        <ExpTab />
      </CustomTabPanel>
      {/* Profile Tab */}
      <CustomTabPanel value={value} index={5}>
        <ProfileTab />
      </CustomTabPanel>
      {/* Notes Tab */}
      <CustomTabPanel value={value} index={6}>
        <NotesTab />
      </CustomTabPanel>
    </>
  );
}

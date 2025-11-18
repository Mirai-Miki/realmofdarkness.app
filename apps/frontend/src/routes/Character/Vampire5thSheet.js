import { Container, Grid2 } from "@mui/material";

import GeneralInfo from "../../components/Sheet5th/Vampire/GeneralInfoTab";
import Attributes from "../../components/Sheet5th/AttributesTab";
import SheetNav from "../../components/Sheet5th/Vampire/SheetNav";
import Skills from "../../components/Sheet5th/SkillsTab";
import TrackerTab from "../../components/Sheet5th/Vampire/TrackerTab";
import SheetSkeleton from "../../components/SheetSkeleton";
import { useState, useEffect, createContext, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getHost, getCSRFToken } from "../../utility";
import { useClientContext } from "../../components/ClientProvider";
import { useAlertContext } from "../../components/AlertProvider";

const SheetContext = createContext(null);
export const useSheetContext = () => useContext(SheetContext);
export const SyncState = {
  SYNC: "Synced",
  UNSYNC: "Uploading",
  ERROR: "Error",
  SYNC_COMPLETE: "Upload Complete",
};

export default function Vampire5thSheet(props) {
  const [lock, setLock] = useState(true);
  const [syncState, setSyncState] = useState(SyncState.SYNC);
  const { client, sheet, setSheet } = useClientContext();
  const { pushAlert } = useAlertContext();
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * Sends an API update request for the sheet if successful apllies the changes to the sheet
   * @param {object} apiUpdate - Update in the ORM JSON format
   * @param {object} sheetUpdate - Sheet update in the Sheet JSON format
   */
  async function handleUpdate(apiUpdate, update) {
    // Creating a deep copy of Skills
    const oldSheet = JSON.parse(JSON.stringify(sheet));
    const sheetUpdate = update ?? apiUpdate;

    // Optimistic update
    setSyncState(SyncState.UNSYNC);
    setSheet((prevSheet) => ({ ...prevSheet, ...sheetUpdate }));

    // API call to update server
    try {
      // Make the API request to update the character's skills
      const response = await fetch(
        `${getHost(true)}/api/character/update/v5/${sheet.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
          body: JSON.stringify(apiUpdate),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        const errorMessage =
          data ??
          "There was an error with this request and the changes have not been applied.";
        pushAlert({ title: "API Error", message: errorMessage });
        setSheet(oldSheet);
        setSyncState(SyncState.ERROR);
        setTimeout(() => setSyncState(SyncState.SYNC), 5000);
        return "error";
      }
    } catch (error) {
      const message =
        "There was an error with this request and the changes have not been applied.";
      pushAlert({ title: "API Error", message: message });
      setSheet(oldSheet);
      setSyncState(SyncState.ERROR);
      setTimeout(() => setSyncState(SyncState.SYNC), 5000);
      return "error";
    }
    setSyncState(SyncState.SYNC_COMPLETE);
    setTimeout(() => setSyncState(SyncState.SYNC), 5000);
  }

  function handleLockChange() {
    if (sheet.st_lock) return setLock(false);
    setLock(!lock);
  }

  ///////////////////////////// Fetch Sheet data /////////////////////////////
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(
          `/api/character/get/v5?id=${id}&sheet=true`
        );
        const data = await response.json();

        if (!response.ok) {
          pushAlert({ title: "API Error", message: data });
          return navigate("/");
        }
        setSheet(data);
      } catch (error) {
        const message = "There was an unknown error fetching this sheet.";
        pushAlert({ title: "API Error", message: message });
        navigate("/");
      }
    };
    fetchSheetData();
    return () => {
      setSheet(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    client.sheetSubscribe(id);
    return () => {
      client.sheetSubscribe(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sheet && sheet.st_lock) setLock(true);
  }, [sheet]);

  const sheetPage = (
    <Container maxWidth="false" sx={{ mt: 10 }}>
      <GeneralInfo handleLockChange={handleLockChange} />
      <TrackerTab />
      <Grid2 container>
        <Grid2
          container
          direction="column"
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Attributes />
          <Skills />
        </Grid2>
        <Grid2
          container
          direction="column"
          rowGap={2}
          size={{
            md: 7,
          }}
        >
          <SheetNav />
        </Grid2>
      </Grid2>
    </Container>
  );

  return (
    <SheetContext.Provider value={{ sheet, lock, handleUpdate, syncState }}>
      {sheet ? sheetPage : <SheetSkeleton />}
    </SheetContext.Provider>
  );
}

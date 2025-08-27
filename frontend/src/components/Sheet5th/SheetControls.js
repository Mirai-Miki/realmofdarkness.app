import { Tooltip, IconButton, Box, Grid2 } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import BlurOnOutlinedIcon from "@mui/icons-material/BlurOnOutlined";
import {
  useSheetContext,
  SyncState,
} from "../../routes/Character/Vampire5thSheet";
import DeleteCharacterButton from "../Sheet/DeleteCharacterButton";
import SheetPreviewNews from "../Sheet/SheetPreviewNews";
import { useClientContext } from "../ClientProvider";
import ExportCharacterJSON from "../Sheet/ExportCharacterJSON";

import { CircularProgress } from "@mui/material";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function SheetControls(props) {
  const { lock, syncState, sheet } = useSheetContext();
  const { user } = useClientContext();
  const { handleLockChange, handleStLockChange } = props;

  function renderLockButton() {
    if (user.id === sheet.user && sheet.st_lock === true) {
      return (
        <Tooltip title="Edit Sheet" arrow>
          <LockIcon
            fontSize="large"
            color="disabled"
            sx={{ marginX: 1, marginTop: 1 }}
          />
        </Tooltip>
      );
    } else if (lock) {
      return (
        <Tooltip title="Edit Sheet" arrow>
          <IconButton onClick={handleLockChange}>
            <LockIcon fontSize="large" color="secondary" />
          </IconButton>
        </Tooltip>
      );
    } else if (!lock) {
      return (
        <Tooltip title="Lock Sheet" arrow>
          <IconButton onClick={handleLockChange}>
            <LockOpenIcon fontSize="large" color="secondary" />
          </IconButton>
        </Tooltip>
      );
    }
  }

  function renderStLockButton() {
    if (user.id === sheet.user && sheet.st_lock === false) {
      return (
        <Tooltip title="Storyteller Unlocked" arrow>
          <LockOpenIcon
            fontSize="large"
            color="primary"
            sx={{ marginX: 1, marginTop: 1 }}
          />
        </Tooltip>
      );
    } else if (user.id === sheet.user && sheet.st_lock === true) {
      return (
        <Tooltip title="Storyteller Locked" arrow>
          <LockIcon
            fontSize="large"
            color="warning"
            sx={{ marginX: 1, marginTop: 1 }}
          />
        </Tooltip>
      );
    } else if (user.id !== sheet.user && sheet.st_lock === true) {
      return (
        <Tooltip title="ST Unlock Sheet" arrow>
          <IconButton onClick={handleStLockChange}>
            <LockIcon fontSize="large" color="primary" />
          </IconButton>
        </Tooltip>
      );
    } else if (user.id !== sheet.user && sheet.st_lock === false) {
      return (
        <Tooltip title="ST Lock" arrow>
          <IconButton onClick={handleStLockChange}>
            <LockOpenIcon fontSize="large" color="warning" />
          </IconButton>
        </Tooltip>
      );
    }
  }

  return (
    <>
      <SyncStateIcon syncState={syncState} />
      <Grid2>{renderLockButton()}</Grid2>
      <Grid2>{renderStLockButton()}</Grid2>
      <SheetPreviewNews />
      <Grid2>
        <ExportCharacterJSON sheet={sheet} />
      </Grid2>
      <Grid2>
        <IconButton disabled>
          <BlurOnOutlinedIcon fontSize="large" color="secondary" />
        </IconButton>
      </Grid2>
      <Grid2>
        <IconButton disabled>
          <BlurOnOutlinedIcon fontSize="large" color="secondary" />
        </IconButton>
      </Grid2>
      <DeleteCharacterButton characterId={sheet.id} />
    </>
  );
}

function SyncStateIcon(props) {
  const { syncState } = props;

  let icon;
  let paddingX = 2;
  switch (syncState) {
    case SyncState.SYNC:
      icon = <CloudCircleIcon fontSize="large" sx={{ color: "#5da9ba" }} />;
      break;

    case SyncState.UNSYNC:
      icon = (
        <Box paddingX="0.25px" marginY="-2.5px">
          <CloudUploadIcon
            color="warning"
            sx={{ marginBottom: "9px", marginLeft: "7.5px" }}
          />
          <CircularProgress
            sx={{
              position: "relative",
              marginY: "0px",
              marginLeft: "-32px",
              zIndex: 1,
            }}
            color="warning"
          />
        </Box>
      );
      paddingX = "13.5px";
      break;

    case SyncState.ERROR:
      icon = <ErrorOutlinedIcon fontSize="large" color="error" />;
      break;

    case SyncState.SYNC_COMPLETE:
      icon = <CheckCircleIcon fontSize="large" color="success" />;
      break;

    default:
      break;
  }

  return (
    <Grid2 paddingTop="9px" paddingX={paddingX}>
      <Tooltip title={`Sheet ${syncState}`} arrow>
        {icon}
      </Tooltip>
    </Grid2>
  );
}

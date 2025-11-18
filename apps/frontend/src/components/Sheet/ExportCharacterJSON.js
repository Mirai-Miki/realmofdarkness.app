import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Tooltip, IconButton } from "@mui/material";

export default function ExportCharacterJson(props) {
  const { sheet } = props;

  function downlaodCharacterJSON() {
    const sheetCopy = { ...sheet };
    // Removing things that shouldn't be exported
    delete sheetCopy.st_lock;
    delete sheetCopy.splat;
    delete sheetCopy.version;
    delete sheetCopy.class;
    delete sheetCopy.created_at;
    delete sheetCopy.last_updated;
    delete sheetCopy.user;
    delete sheetCopy.id;
    delete sheetCopy.member;
    delete sheetCopy.is_sheet;

    const json = JSON.stringify(sheetCopy, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheet.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Tooltip title="Export JSON">
      <IconButton onClick={downlaodCharacterJSON}>
        <FileDownloadIcon fontSize="large" color="secondary" />
      </IconButton>
    </Tooltip>
  );
}

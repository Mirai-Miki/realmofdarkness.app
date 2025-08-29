import React, { useState } from "react";
import {
  Tooltip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PDFGeneratorFactory from "./PDFGenerator/PDFGeneratorFactory";

/**
 * Modular component for exporting character sheet PDFs
 * Automatically detects sheet type and exports directly
 */
export default function PDFImportExport({ sheet }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Function to detect sheet type from sheet.splat
  const detectSheetType = (sheet) => {
    if (!sheet || !sheet.splat) return "v5"; // Default fallback

    const splat = sheet.splat.toLowerCase();

    // Map splat values to sheet type codes
    const splatToSheetType = {
      vampire5th: "v5",
      werewolf5th: "w5",
      hunter5th: "h5",
      human5th: "h5",
      ghoul5th: "g5",
      vampire20th: "v20",
      werewolf20th: "w20",
      mage20th: "m20",
      changeling20th: "c20",
      wraith20th: "wr20",
      demon20th: "d20",
      human20th: "h20",
      ghoul20th: "g20",
    };

    return splatToSheetType[splat] || "v5";
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const sheetType = detectSheetType(sheet);
      const generator = PDFGeneratorFactory.createGenerator(sheetType, sheet, {
        useEditable: true,
      });

      await generator.generate();
    } catch (err) {
      setError(`Error exporting PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };



  return (
    <>
      <Tooltip title="Export as Editable PDF">
        <IconButton onClick={handleExport} disabled={isProcessing}>
          {isProcessing ? (
            <CircularProgress size={24} color="secondary" />
          ) : (
            <PictureAsPdfIcon fontSize="large" color="secondary" />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid2,
} from "@mui/material";

export default function ItemInfoDialog({
  open,
  onClose,
  selectedItem,
  itemInfo,
}) {
  if (!selectedItem || !itemInfo) return null;

  // Dynamically create info sections based on available data
  const infoSections = [];

  // Common fields that might exist
  const fieldMapping = {
    description: "Description",
    disciplines: "Disciplines",
    bane: "Clan Bane",
    variantBane: "Variant Bane",
    compulsion: "Compulsion",
    // Add more mappings as needed for other item types
  };

  // Build sections from available data
  Object.entries(fieldMapping).forEach(([key, title]) => {
    if (
      itemInfo[key] &&
      // Don't show variant bane if it's just placeholder text
      !(
        key === "variantBane" &&
        (itemInfo[key].includes("Details not available") ||
          itemInfo[key].includes("No variant bane"))
      )
    ) {
      infoSections.push({ title, content: itemInfo[key] });
    }
  });

  // If no sections were found, show a generic message
  if (infoSections.length === 0) {
    infoSections.push({
      title: "Information",
      content: "No detailed information available for this item.",
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="item-info-dialog-title"
      PaperProps={{
        style: {
          backgroundColor: "#1a1a1a",
          margin: "16px",
        },
      }}
    >
      <DialogTitle
        id="item-info-dialog-title"
        sx={{
          color: "#ffd700",
          padding: { xs: 2, sm: 3 },
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
        }}
      >
        {selectedItem}
      </DialogTitle>
      <DialogContent sx={{ padding: { xs: 2, sm: 3 } }}>
        <Grid2 container spacing={2}>
          {infoSections.map(({ title, content }) => (
            <Grid2 key={title} xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#ffd700",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  marginTop: title !== "Description" ? "8px" : 0,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: "1.5",
                }}
              >
                {content}
              </Typography>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ padding: { xs: 2, sm: 3 }, paddingTop: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          autoFocus
          sx={{
            color: "#ffd700",
            borderColor: "#ffd700",
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
            },
            "&:focus": {
              borderColor: "#fff",
              boxShadow: "0 0 0 2px rgba(255, 215, 0, 0.3)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function TextView({ header, children, ...typographyProps }) {
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {header}
      </Typography>
      <Typography {...typographyProps}>{children}</Typography>
    </Box>
  );
}

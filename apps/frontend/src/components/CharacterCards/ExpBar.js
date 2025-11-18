import { Typography, Divider, Box } from "@mui/material";

export default function Vampire5thInfo(props) {
  const { exp } = props;

  if (!exp?.total) return undefined;

  return (
    <Box>
      <Divider sx={{ my: 1 }} />
      <Typography sx={{ pt: 0.5, mb: -0.5 }}>
        Exp: {exp.current}/{exp.total}
      </Typography>
    </Box>
  );
}

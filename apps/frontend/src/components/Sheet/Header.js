import { Divider, Typography, Grid2 } from "@mui/material";

export default function Header(props) {
  const { children, ...gridProps } = props;

  return (
    <Grid2 {...gridProps} size={12}>
      <Divider variant="middle">
        <Typography variant="h4" component="h2" color="#80172f">
          {children}
        </Typography>
      </Divider>
    </Grid2>
  );
}

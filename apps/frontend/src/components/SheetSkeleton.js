import { Container, Skeleton, Grid2 } from "@mui/material";

export default function SheetSkeleton(props) {
  return (
    <Container sx={{ mt: 10 }}>
      <Skeleton height={200} />
      <Skeleton height={50} />
      <Grid2 container spacing={5}>
        <Grid2
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Skeleton sx={{ height: { xs: 200, md: 500 } }} />
          <Skeleton height={100} />
        </Grid2>
        <Grid2
          sx={{ display: { xs: "none", md: "block" } }}
          size={{
            md: 7,
          }}
        >
          <Skeleton height={100} />
          <Skeleton height={200} />
          <Skeleton height={200} />
          <Skeleton height={100} />
        </Grid2>
      </Grid2>
    </Container>
  );
}

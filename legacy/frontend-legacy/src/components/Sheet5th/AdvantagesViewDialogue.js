import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  Divider,
} from "@mui/material";
import RatingInfo from "./SheetRating";
import TextView from "../TextView";

export default function AdvantagesViewDialogue(props) {
  const { open, handleClose } = props;
  const item = open;

  function renderStackOne() {
    let modifier;
    let flaw;

    if (item?.modifier > 0)
      modifier = <Typography>Dice Modifier: {item?.modifier ?? 0}</Typography>;
    if (item?.flaw) flaw = <Typography color="error">Flaw</Typography>;

    if (!modifier && !flaw) return null;
    else
      return (
        <Stack
          direction="row"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          {modifier ? modifier : null}
          {flaw ? flaw : null}
        </Stack>
      );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle color="primary" alignSelf="center">
        <Stack direction="row" spacing={1}>
          <Typography variant="h5" component="h1">
            {item?.name ?? ""}
          </Typography>
          <RatingInfo
            sx={{ paddingTop: 0.7 }}
            locked
            size="small"
            name="rating"
            value={item?.rating ?? 0}
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack paddingTop={1} spacing={2}>
          {renderStackOne()}
          {item?.description ? (
            <TextView header="Description">{item.description}</TextView>
          ) : undefined}
          {item?.notes ? (
            <TextView header="Notes">{item.notes}</TextView>
          ) : undefined}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

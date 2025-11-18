import { MenuItem } from "@mui/material";
import { useClientContext } from "../../ClientProvider";

function ChronicleMenuItems(allOption) {
  const { chronicles } = useClientContext();
  const menu = [];

  menu.push(
    <MenuItem key="chronicle-0" value="">
      No Server
    </MenuItem>
  );
  if (allOption)
    menu.push(
      <MenuItem key="all" value="all">
        All
      </MenuItem>
    );

  if (!chronicles) return menu;
  for (const chronicle of Object.values(chronicles)) {
    menu.push(
      <MenuItem key={chronicle.id} value={chronicle.id}>
        {chronicle.name}
      </MenuItem>
    );
  }
  return menu;
}

export default ChronicleMenuItems;

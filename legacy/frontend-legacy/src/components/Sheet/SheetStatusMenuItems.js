import { MenuItem } from "@mui/material";

function SheetStatusMenuItems() {
  return [
    <MenuItem key="SS-1" value={1}>
      Draft
    </MenuItem>,
    <MenuItem key="SS-3" value={3}>
      Active
    </MenuItem>,
    <MenuItem key="SS-4" value={4}>
      Dead (Archived)
    </MenuItem>,
    <MenuItem key="SS-5" value={5}>
      Archive
    </MenuItem>,
  ];
}

export default SheetStatusMenuItems;

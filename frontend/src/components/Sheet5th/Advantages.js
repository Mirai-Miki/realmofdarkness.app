import { Button, TextField, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RatingInfo from "./SheetRating";
import AdvantagesDialogue from "./AdvantagesDialogue";
import { useState, useEffect } from "react";

import { useSheetContext } from "../../routes/Character/Vampire5thSheet";

export default function Advantages(props) {
  const { name, handleOpenView } = props;
  const { lock, sheet, handleUpdate } = useSheetContext();
  let sheetItem = sheet[name];

  // Item is {name, description, rating}
  const [items, setItems] = useState(sheetItem);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState(null);

  useEffect(() => {
    setItems(sheetItem);
  }, [sheetItem]);

  async function handleSave(value) {
    const copy = [];
    const update = updateItem?.index === undefined ? false : true;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (update && i === updateItem.index) {
        copy.push(value);
      } else {
        copy.push(item);
      }
    }
    if (!update) copy.push(value);
    await handleUpdate({ [name]: copy });
  }

  async function handleDelete(index) {
    const copy = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i === index) continue;
      else copy.push(item);
    }
    await handleUpdate({ [name]: copy });
  }

  return (
    <Stack
      alignItems="center"
      justifyContent="flex-start"
      paddingX={2}
      sx={{ width: "100%" }}
    >
      {items.map((item, index) => (
        <Item
          item={item}
          index={index}
          key={index}
          lock={lock}
          handleDelete={handleDelete}
          setUpdateItem={setUpdateItem}
          setIsModalOpen={setIsModalOpen}
          handleOpenView={handleOpenView}
        />
      ))}
      {lock ? null : (
        <Button
          sx={{ marginTop: 2 }}
          variant="outlined"
          onClick={() => setIsModalOpen(true)}
        >
          Add {name}
        </Button>
      )}
      <AdvantagesDialogue
        slug={name}
        open={isModalOpen}
        item={updateItem?.item}
        onClose={() => {
          setIsModalOpen(false);
          setUpdateItem(null);
        }}
        onSave={(newItem) => handleSave(newItem)}
      />
    </Stack>
  );
}

function Item(props) {
  const {
    index,
    item,
    lock,
    handleDelete,
    setIsModalOpen,
    setUpdateItem,
    handleOpenView,
  } = props;

  const renderEditButtons = () => (
    <>
      <IconButton
        onClick={() => {
          setUpdateItem({ item, index });
          setIsModalOpen(true);
        }}
      >
        <EditIcon color="primary" />
      </IconButton>
      <IconButton
        onClick={() => {
          handleDelete(index);
        }}
      >
        <DeleteIcon color="error" />
      </IconButton>
    </>
  );

  return (
    <Stack
      direction="row"
      onClick={() => {
        if (lock) handleOpenView(item);
      }}
      sx={{
        minHeight: "40px",
        width: "100%",
        cursor: lock ? "pointer" : "default",
        pointerEvents: "auto",
      }}
    >
      <TextField
        fullWidth
        variant="standard"
        size="small"
        disabled
        value={item.name}
        sx={{ alignSelf: "center", pointerEvents: "none" }}
      />
      <RatingInfo
        locked
        value={item.rating}
        filledColor={item.flaw ? undefined : "#6f20ab"}
        sx={{ paddingTop: 1.5, paddingLeft: 1 }}
      />
      {lock ? null : renderEditButtons()}
    </Stack>
  );
}

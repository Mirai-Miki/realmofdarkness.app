export const character_update = {
  name: "UPDATE_CHARACTER",
  async execute(data, clientState) {
    if (data.sheet) clientState.setSheet(data.sheet);
    clientState.setCharacters((prevCharacters) => {
      return { ...prevCharacters, [data.id]: data.character };
    });
  },
};

export const character_delete = {
  name: "DELETE_CHARACTER",
  async execute(data, clientState) {
    clientState.setCharacters((prevCharacters) => {
      delete prevCharacters[data.id];
      return { ...prevCharacters };
    });
  },
};

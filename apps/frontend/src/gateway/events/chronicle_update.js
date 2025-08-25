export const chronicle_update = {
  name: "UPDATE_CHRONICLE",
  async execute(data, clientState) {
    clientState.setChronicles((prevChronicles) => {
      return { ...prevChronicles, [data.chronicle.id]: data.chronicle };
    });
  },
};

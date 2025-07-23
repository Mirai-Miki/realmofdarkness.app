export const Ready = {
  name: "READY",
  async execute(data, clientState) {
    clientState.setUser(data.user);
    clientState.setCharacters(data.characters);
    clientState.setChronicles(data.chronicles);
    clientState.setMembers(data.members);
  },
};

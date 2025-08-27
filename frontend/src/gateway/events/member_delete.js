export const member_delete = {
  name: "DELETE_MEMBER",
  async execute(data, clientState) {
    const member = data.member;
    const chronicleId = member.chronicle;
    const userId = member.user;

    // Check if this is the current user being removed
    const isCurrentUser = clientState.user && clientState.user.id === userId;

    // If this is the current user being removed, clean up ALL chronicle data
    if (isCurrentUser) {
      // Remove the chronicle from state first
      clientState.setChronicles((prevChronicles) => {
        const chronicles = { ...prevChronicles };
        delete chronicles[chronicleId];
        return chronicles;
      });

      // Remove OTHER people's characters from this chronicle from state
      // For our own characters, update them to have chronicle=null (matches backend behavior)
      clientState.setCharacters((prevCharacters) => {
        const characters = { ...prevCharacters };

        Object.keys(characters).forEach((characterId) => {
          const character = characters[characterId];
          if (character && character.chronicle === chronicleId) {
            if (character.user !== userId) {
              // Remove other people's characters completely
              delete characters[characterId];
            } else {
              // For our own characters, set chronicle to null (matches backend)
              characters[characterId] = {
                ...character,
                chronicle: null,
              };
            }
          }
        });

        return characters;
      });

      // Remove ALL members from this chronicle from state
      clientState.setMembers((prevMembers) => {
        const members = { ...prevMembers };
        delete members[chronicleId];
        return members;
      });
    } else {
      // Just remove the specific member from state (for staff viewing other users leave)
      clientState.setMembers((prevMembers) => {
        const members = { ...prevMembers };

        if (members[chronicleId] && members[chronicleId][userId]) {
          // Remove the specific member
          delete members[chronicleId][userId];
        }

        return members;
      });
    }
  },
};

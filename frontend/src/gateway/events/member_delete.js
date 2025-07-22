export const member_delete = {
  name: "DELETE_MEMBER",
  async execute(data, contextSetters) {
    const member = data.member;
    const chronicleId = member.chronicle;
    const userId = member.user;

    // We need to check if this is the current user being removed
    // We can do this by accessing the current user state through the setter pattern
    let isCurrentUser = false;

    // First get the current user by using the setter with identity function
    contextSetters.setUser((currentUser) => {
      isCurrentUser = currentUser && currentUser.id === userId;
      return currentUser; // Return unchanged
    });

    // If this is the current user being removed, clean up ALL chronicle data
    if (isCurrentUser) {
      // Remove the chronicle from state first
      contextSetters.setChronicles((prevChronicles) => {
        const chronicles = { ...prevChronicles };
        delete chronicles[chronicleId];
        return chronicles;
      });

      // Remove ALL characters from this chronicle from state
      contextSetters.setCharacters((prevCharacters) => {
        const characters = { ...prevCharacters };

        // Remove all characters that belong to this chronicle
        Object.keys(characters).forEach((characterId) => {
          const character = characters[characterId];
          if (character && character.chronicle === chronicleId) {
            delete characters[characterId];
          }
        });

        return characters;
      });

      // Remove ALL members from this chronicle from state
      contextSetters.setMembers((prevMembers) => {
        const members = { ...prevMembers };
        delete members[chronicleId];
        return members;
      });
    } else {
      // Just remove the specific member from state (for staff viewing other users leave)
      contextSetters.setMembers((prevMembers) => {
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

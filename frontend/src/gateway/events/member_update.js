export const member_update = {
  name: "UPDATE_MEMBER",
  async execute(data, clientState) {
    clientState.setMembers((prevMembers) => {
      const members = { ...prevMembers };

      // Ensure the chronicle structure exists before trying to access it
      if (!members[data.member.chronicle]) {
        members[data.member.chronicle] = {};
      }

      members[data.member.chronicle][data.member.user] = data.member;
      return members;
    });
  },
};

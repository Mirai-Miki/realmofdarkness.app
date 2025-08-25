export const user_update = {
  name: "UPDATE_USER",
  async execute(data, clientState) {
    clientState.setUser(data["user"]);
  },
};

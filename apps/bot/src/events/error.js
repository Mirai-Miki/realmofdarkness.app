"use strict";
module.exports = {
  name: "error",
  once: false,
  execute(error) {
    console.log(
      `An Error was encounted.\n` +
        `Error Name: ${error.name}\n` +
        `Message: ${error.message}`
    );
  },
};

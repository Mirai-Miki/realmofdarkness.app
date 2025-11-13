import { logger } from "shared/logger";

module.exports = {
  name: "error",
  once: false,
  execute(error: Error) {
    logger.exception("An unknown error occurred", error, {
      location: "bot/src/events/error.ts",
    });
  },
};

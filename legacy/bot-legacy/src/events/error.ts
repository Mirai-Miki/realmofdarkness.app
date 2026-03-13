import { logger } from "@realm/logger";

module.exports = {
  name: "error",
  once: false,
  execute(error: Error) {
    logger.exception("An unknown error occurred", error);
  },
};

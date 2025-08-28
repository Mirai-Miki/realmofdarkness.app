import { Logging } from "shared/logger";

const logger = Logging.getLogger();

module.exports = {
  name: "error",
  once: false,
  execute(error: Error) {
    logger.exception(error);
  },
};

"use strict";
require(`${process.cwd()}/alias`);
const Axios = require("axios");
const dotenv = require("dotenv");
const { APIErrorCodes, RealmAPIError } = require("@errors");

// Load environment variables
dotenv.config();

/**
 * Sends a POST request to the specified path with the provided data.
 *
 * @param {string} path - The path to send the POST request to.
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<object>} - A promise that resolves to the response object.
 * @throws {RealmAPIError} - If there is an error during the request.
 */
module.exports.postData = async (path, data) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: (status) => status >= 200 && status < 500,
  };

  // Use API_KEY from environment variables
  data.APIKey = process.env.API_KEY;

  // Determine if we're in development OR preproduction mode
  const isDev = process.env.NODE_ENV !== "production";

  try {
    // Use different port based on environment
    const port = isDev ? 8080 : 80;
    const host = process.env.API_HOST || "127.0.0.1";

    const res = await Axios.post(
      `http://${host}:${port}/bot/${path}`,
      data,
      config
    );

    // Remove sensitive data before returning
    delete data.APIKey;
    return res;
  } catch (error) {
    // Remove sensitive data from error logs
    delete data.APIKey;

    if (error.code === "ECONNREFUSED")
      throw new RealmAPIError({
        cause: error.stack,
        code: APIErrorCodes.ConnectionRefused,
      });
    else
      throw new RealmAPIError({
        cause: error.stack + `\n\nData:\n${JSON.stringify(data)}`,
      });
  }
};

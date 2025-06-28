/**
 * Takes in a string lowercases it and replaces spaces with underscores
 * @param {String} name name to slugify
 * @returns Slugified string
 */
export function slugify(name) {
  if (!name) return null;
  return name.toLowerCase().split(" ").join("_");
}

/**
 * Gets the correct hostname for Development, Preproduction, and Production
 * - For localhost/127.0.0.1: returns dev/proxy host
 * - For any other domain (including preproduction like dev.realmofdarkness.app): returns https://currentHost
 * @param {Boolean} proxy If the Dev environment should proxy the request
 * @returns Hostname for dev, preproduction, or production
 */
export function getHost(proxy) {
  const currentHost = window.location.hostname;
  const port = window.location.port;

  // Check if running in development with a proxy
  if (
    (currentHost === "localhost" || currentHost === "127.0.0.1") &&
    port !== "80" &&
    proxy
  ) {
    return "";
  } else if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return "http://127.0.0.1";
  } else {
    // Handles production and preproduction (e.g., dev.realmofdarkness.app)
    return `https://${currentHost}`;
  }
}

/**
 * Retrieves the CSRF Token from the cookie and returns it
 * @returns CSRF Token
 */
export function getCSRFToken() {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    .split("=")[1];

  return cookieValue;
}

export function getSerializerErrors(errors) {
  let errorMessage = "";
  for (const key of Object.keys(errors)) {
    const array = errors[key];
    for (const value of array) {
      if (errorMessage === "") errorMessage = value;
      else errorMessage += `\n${value}`;
    }
  }
  return errorMessage;
}

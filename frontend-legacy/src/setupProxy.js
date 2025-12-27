const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Common proxy options
  const proxyOptions = {
    target: "http://localhost:8080", // Replace with your Django server URL
    changeOrigin: true,
    secure: false,
  };

  // Proxy API requests
  app.use("/api", createProxyMiddleware(proxyOptions));

  // Proxy media requests
  app.use("/media", createProxyMiddleware(proxyOptions));
};

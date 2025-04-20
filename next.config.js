// next.config.js
const path = require("path");

module.exports = {
  webpack: (config) => {
    config.resolve.alias["@tailwindcss/postcss"] = require.resolve("tailwindcss");
    return config;
  },
};

const crypto = require("crypto");

module.exports = function uuid() {
  return crypto.randomUUID();
}
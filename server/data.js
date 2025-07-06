const auth = require("./data/auth")
const connections = require("./data/connections")

module.exports = function () {
  return {
    auth: auth(),
    connections: connections(),
  }
}
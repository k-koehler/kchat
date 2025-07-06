const auth = require("./data/auth")
const connections = require("./data/connections")
const favouriteModel = require("./data/favourite-model")

module.exports = function () {
  return {
    auth: auth(),
    connections: connections(),
    favouriteModel: favouriteModel(),
  }
}
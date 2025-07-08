const auth = require("./data/auth")
const chat = require("./data/chat")
const connections = require("./data/connections")
const favouriteModel = require("./data/favourite-model")
const message = require("./data/message")

module.exports = function () {
  return {
    auth: auth(),
    chat: chat(),
    connections: connections(),
    favouriteModel: favouriteModel(),
    message: message(),
  }
}
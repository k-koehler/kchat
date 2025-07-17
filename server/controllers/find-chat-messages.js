const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function findChatMessages({
  res,
}, body) {
  const messages = await data.message.findMessagesByChatId(body.chatId);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(messages));
});
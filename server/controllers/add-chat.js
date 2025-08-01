const data = require("../data")();
const withAuth = require("../helpers/with-auth");
const OpenAi = require("../openai");

module.exports = withAuth(async function addChat({ res }, body) {
  const chatId = await data.chat.addChat({
    title: "New Chat",
  });
  if (!body.content || !body.connectionId || !body.modelId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "content, connectionId, and modelId are required",
      })
    );
    return;
  }
  const messageId = await data.message.addMessage({
    chatId,
    openAiRole: "user",
    openAiStreamStatus: "pending",
    connectionId: body.connectionId,
    modelId: body.modelId,
    content: body.content,
  });
  OpenAi.dispatchMessage(await data.message.findMessage(messageId));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(chatId));
});

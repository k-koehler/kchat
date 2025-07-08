const DB = require("../db");
const messageDb = new DB("data/message.db");

// interface Message {
//   id: string;
//   chatId: string;
//   openAiRole: string;
//   openAiStartedStreamingAt?: string;
//   openAiFinishedStreamingAt?: string;
//   openAiStreamStatus: "pending" | "streaming" | "finished" | "error";
//   openAiStreamError?: string;
//   connectionId: string;
//   modelId: string;
//   content: string;
//   createdAt: string;
// }

module.exports = function message() {
  async function addMessage(message) {
    return messageDb.insert(message);
  }

  async function getMessage(id) {
    return messageDb.select(id);
  }

  async function getAllMessages() {
    return messageDb.selectAll();
  }

  async function getMessagesByChatId(chatId) {
    return messageDb.selectWhere((message) => message.chatId === chatId)
      .sort((a) => a.openAiRole === "system" ? -1 : 1)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return {
    addMessage,
    getMessage,
    getAllMessages,
    getMessagesByChatId,
  };

}
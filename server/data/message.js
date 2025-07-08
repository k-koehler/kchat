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
    message.createdAt = new Date().toISOString();
    return messageDb.insert(message);
  }

  async function findMessage(id) {
    return messageDb.select(id);
  }

  async function findAllMessages() {
    return messageDb.selectAll();
  }

  async function findMessagesByChatId(chatId) {
    return (await messageDb.selectWhere((message) => message.chatId === chatId))
      .sort((a) => (a.openAiRole === "system" ? -1 : 1))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async function findPendingMessages() {
    return messageDb.selectWhere(
      (message) => message.openAiStreamStatus === "pending"
    );
  }

  async function updateMessage(id, update) {
    return messageDb.update(id, update);
  }

  return {
    addMessage,
    findMessage,
    findAllMessages,
    findPendingMessages,
    findMessagesByChatId,
    updateMessage,
  };
};

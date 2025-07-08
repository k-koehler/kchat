const DB = require("../db");
const chatDb = new DB("data/chat.db");


// interface Chat {
//   id: string;
//   title: string;
//   createdAt: string;
// }

module.exports = function chat() {
  async function addChat(chat) {
    return chatDb.insert(chat);
  }

  async function getChat(id) {
    return chatDb.select(id);
  }

  async function getAllChats() {
    return chatDb.selectAll();
  }

  return {
    addChat,
    getChat,
    getAllChats,
  };
}
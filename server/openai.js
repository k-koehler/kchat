const data = require("./data")();

module.exports = class OpenAi {
  static #MAX_STREAMS = 1;

  static #pending = [];
  static #streaming = [];
  static #readStreams = {};

  static async #process(message) {
    try {
      OpenAi.#streaming.push(message);
      const allMessages = await data.message.getMessagesByChatId(message.chatId);
      const connection = await data.connections.getConnection(message.connectionId);
      const model = await data.favouriteModel.getFavouriteModel(message.modelId);
      console.log("Ready to stream message", {
        messageId: message.id,
        chatId: message.chatId,
        connectionId: message.connectionId,
        modelId: message.modelId,
        allMessages,
        connection,
        model,
      });
    } catch { } finally {
      OpenAi.#tick();
    }
  }

  static #tick() {
    if (OpenAi.#pending.length === 0) {
      return;
    }
    const streamsToProcess =
      OpenAi.#pending.slice(0, OpenAi.#MAX_STREAMS - OpenAi.#streaming.length);
    for (const message of streamsToProcess) {
      OpenAi.#process(message);
    }
  }

  static dispatchMessage(message) {
    OpenAi.#pending.push(message);
    OpenAi.#tick();
  }

  static getReadStream(id) {
    throw new Error("Not implemented");
  }
}
const OpenAi = require("./openai");

const data = require("./data")();

module.exports = async function init() {
  await data.auth.createInitialUser();
  for (const message of await data.message.findPendingMessages()) {
    OpenAi.dispatchMessage(message);
  }
};

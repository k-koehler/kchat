const data = require("./data")();

module.exports = async function init() {
  await data.auth.createInitialUser();
}
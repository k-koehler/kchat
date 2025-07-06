const persistedJson = require("../helpers/persisted-json");
const uuid = require("../helpers/uuid");
const connectionsJson = persistedJson("data/connections.json");

module.exports = function connections() {
  function addConnection({
    host,
    key,
    name,
  }) {
    const connection = {
      id: uuid(),
      host,
      key,
      name,
      createdAt: new Date().toISOString(),
    };
    connectionsJson[connection.id] = connection;
    return connection;
  }

  function findConnections() {
    return Object.values(connectionsJson).filter(conn => conn.id);
  }

  return {
    addConnection,
    findConnections,
  };
}
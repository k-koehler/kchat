const DB = require("../db");
const connectionsDb = new DB("data/connections.db");

module.exports = function connections() {
  function addConnection({
    host,
    key,
    name,
  }) {
    const id = connectionsDb.insert({
      host,
      key,
      name,
      createdAt: new Date().toISOString(),
    });
    return connectionsDb.select(id);
  }

  function findConnections() {
    return connectionsDb.selectAll();
  }

  async function fetchConnectionModels(connectionId) {
    const connection = connectionsDb.select(connectionId);
    try {
      const response = await fetch(`${connection.host}/models`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...connection.key ? { Authorization: `Bearer ${connection.key}` } : {},
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const result = {
        connection,
        models: (await response.json()).data.sort((a, b) => a.id.localeCompare(b.id)),
      };
      return result;
    } catch {
      return {
        connection,
        models: null,
      };
    }
  }

  async function findAllConnectionsModels() {
    const connections = findConnections();
    const connectionsModels = await Promise.all(
      connections.map(c => fetchConnectionModels(c.id))
    );
    return connectionsModels.sort((a, b) => a.connection.id.localeCompare(b.connection.id))
  }


  return {
    addConnection,
    findConnections,
    fetchConnectionModels,
    findAllConnectionsModels,
  };
}
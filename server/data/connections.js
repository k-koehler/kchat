const DB = require("../db");
const connectionsDb = new DB("data/connections.db");

// interface Connection {
//   id: string;
//   host: string;
//   key: string;
//   name: string;
//   createdAt: string;
// }

module.exports = function connections() {
  async function addConnection({ host, key, name }) {
    const id = connectionsDb.insert({
      host,
      key,
      name,
      createdAt: new Date().toISOString(),
    });
    return connectionsDb.select(id);
  }

  function findConnection(id) {
    return connectionsDb.select(id);
  }

  function findConnections() {
    return connectionsDb.selectAll();
  }

  async function fetchConnectionModels(connectionId) {
    const connection = await connectionsDb.select(connectionId);
    try {
      const response = await fetch(`${connection.host}/models`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(connection.key
            ? { Authorization: `Bearer ${connection.key}` }
            : {}),
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const result = {
        connection,
        models: (await response.json()).data.sort((a, b) =>
          a.id.localeCompare(b.id)
        ),
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
    const connections = await findConnections();
    const connectionsModels = await Promise.all(
      connections.map((c) => fetchConnectionModels(c.id))
    );
    return connectionsModels.sort((a, b) =>
      a.connection.id.localeCompare(b.connection.id)
    );
  }

  return {
    addConnection,
    findConnections,
    findConnection,
    fetchConnectionModels,
    findAllConnectionsModels,
  };
};

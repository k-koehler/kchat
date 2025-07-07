const DB = require("../db");
const favouriteModelDb = new DB("data/favourite-model.db");
const connections = require("./connections")();

module.exports = function favouriteModel() {
  function setFavoriteModel({ userId, connectionId, modelId }) {
    const existing = favouriteModelDb.selectWhereOne(
      (f) => f.userId === userId
    );
    if (
      existing &&
      existing.userId === userId &&
      existing.connectionId === connectionId &&
      existing.modelId === modelId
    ) {
      return;
    } else if (existing) {
      favouriteModelDb.update(existing.id, {
        userId,
        connectionId,
        modelId,
        createdAt: existing.createdAt,
      });
    } else {
      favouriteModelDb.insert({
        userId,
        connectionId,
        modelId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function findFavoriteModelByUserId(userId) {
    const favourite = favouriteModelDb.selectWhereOne(
      (f) => f.userId === userId
    );
    if (favourite) {
      return favourite;
    }
    const all = await connections.findAllConnectionsModels();
    const connection = all[0]?.connection;
    const model = all[0]?.models?.[0];
    if (connection && model) {
      setFavoriteModel({
        userId,
        connectionId: connection.id,
        modelId: model.id,
      });
      return favouriteModelDb.selectWhereOne((f) => f.userId === userId);
    }
    return null;
  }

  return {
    setFavoriteModel,
    findFavoriteModelByUserId,
  };
};

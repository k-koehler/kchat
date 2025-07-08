const DB = require("../db");
const favouriteModelDb = new DB("data/favourite-model.db");
const connections = require("./connections")();

// interface FavouriteModel {
//   id: string;
//   userId: string;
//   connectionId: string;
//   modelId: string;
//   createdAt: string;
// }

module.exports = function favouriteModel() {
  async function setFavoriteModel({ userId, connectionId, modelId }) {
    const existing = await favouriteModelDb.selectWhereOne(
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
      await favouriteModelDb.update(existing.id, {
        userId,
        connectionId,
        modelId,
        createdAt: existing.createdAt,
      });
    } else {
      await favouriteModelDb.insert({
        userId,
        connectionId,
        modelId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function findFavoriteModelByUserId(userId) {
    const favourite = await favouriteModelDb.selectWhereOne(
      (f) => f.userId === userId
    );
    if (favourite) {
      return favourite;
    }
    const all = await connections.findAllConnectionsModels();
    const connection = all[0]?.connection;
    const model = all[0]?.models?.[0];
    if (connection && model) {
      await setFavoriteModel({
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

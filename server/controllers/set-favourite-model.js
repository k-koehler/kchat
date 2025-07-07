const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function setFavouriteModel({
  res,
  requester,
}, body) {
  const { connectionId, modelId } = body;
  if (!connectionId || !modelId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "connectionId and modelId are required" }));
    return;
  }
  data.favouriteModel.setFavoriteModel({
    userId: requester.id,
    connectionId,
    modelId,
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({}));
});
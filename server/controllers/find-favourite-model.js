const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function findFavouriteModel({
  res,
  requester,
}) {
  const favouriteModel = await data.favouriteModel.findFavoriteModelByUserId(requester.id);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(favouriteModel));
});
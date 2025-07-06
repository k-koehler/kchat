const data = require("../data")();
const withAuth = require("../helpers/with-auth");


module.exports = withAuth(async function findModels({
  res,
}) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(await data.connections.findAllConnectionsModels()));
});
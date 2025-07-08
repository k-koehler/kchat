const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function findConnections({
  res,
}) {
  const connections = await data.connections.findConnections();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(connections));
});
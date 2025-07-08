const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function addConnection({
  req,
  res,
}, body) {
  if (!body.name || !body.host) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Name and host are required" }));
    return;
  }
  const connection = await data.connections.addConnection({
    name: body.name,
    host: body.host,
    key: body.key || "",
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(connection));
});
const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function findUsers({
  res,
}) {
  const users = await data.auth.findUsers();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(users));
});
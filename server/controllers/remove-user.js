const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function removeUser({
  res,
}, body) {
  const { username } = body;
  if (!username) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Username is required" }));
    return;
  }
  await data.auth.removeUser(username);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({}));
});
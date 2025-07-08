const data = require("../data")();
const withAuth = require("../helpers/with-auth");

module.exports = withAuth(async function addUser({ res }, body) {
  const { username, password } = body;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Username and password are required" }));
    return;
  }
  await data.auth.addUser({ username, password });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({}));
});

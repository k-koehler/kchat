const data = require("../data")();

module.exports = async function login({
  res,
}, body) {
  const token = await data.auth.login(body.username, body.password);
  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid username or password" }));
  }
  else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  }
};
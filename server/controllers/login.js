const data = require("../data")();

module.exports = function login({
  res,
}, body) {
  const token = data.auth.login(body.username, body.password);
  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid username or password" }));
  }
  else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  }
};
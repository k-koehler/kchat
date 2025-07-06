const data = require("../data")();

module.exports = function withAuth(handler) {
  return (arg, body) => {
    const sessionId = arg.req.headers["x-kchat-token"];
    if (!sessionId) {
      arg.res.writeHead(401, { "Content-Type": "application/json" });
      arg.res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    if (!data.auth.checkSession(sessionId)) {
      arg.res.writeHead(401, { "Content-Type": "application/json" });
      arg.res.end(JSON.stringify({ error: "Invalid session" }));
      return;
    }
    return handler({ ...arg, sessionId }, body);
  };
};

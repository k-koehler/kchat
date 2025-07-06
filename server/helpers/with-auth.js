const data = require("../data")();

module.exports = function withAuth(handler) {
  const wrappedHandler = (arg, body) => {
    const sessionId = arg.req.headers["x-kchat-token"];
    if (!sessionId) {
      arg.res.writeHead(401, { "Content-Type": "application/json" });
      arg.res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    const requester = data.auth.checkSession(sessionId);
    if (!requester) {
      arg.res.writeHead(401, { "Content-Type": "application/json" });
      arg.res.end(JSON.stringify({ error: "Invalid session" }));
      return;
    }
    return handler({ ...arg, requester, }, body);
  };
  wrappedHandler.controllerName = handler.name;
  return wrappedHandler;
};

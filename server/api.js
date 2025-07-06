const http = require("http");
const login = require("./controllers/login");
const findUsers = require("./controllers/find-users");
const addUser = require("./controllers/add-user");
const removeUser = require("./controllers/remove-user");

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }
    if (req.headers["content-type"] !== "application/json") {
      res.writeHead(415, { "Content-Type": "text/plain" });
      res.end("Unsupported Content Type");
      return;
    }
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        let json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }
        const { topic, data } = json;
        if (!topic) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Topic is required" }));
          return;
        }
        if (!data) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Data is required" }));
          return;
        }
        switch (topic) {
          case "login":
            return login({
              req,
              res,
            }, data);
          case "findUsers":
            return findUsers({
              req,
              res,
            });
          case "addUser":
            return addUser({
              req,
              res,
            }, data);
          case "removeUser":
            return removeUser({
              req,
              res,
            }, data);
          default:
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Unknown topic: ${topic}` }));
            return;
        }
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error");
  }
});

module.exports = function () {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`API server is running at http://0.0.0.0:${PORT}`);
  });
  server.on("error", (error) => {
    console.error("Server error:", error);
  });
}


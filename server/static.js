const http = require("http");
const readWebFile = require("./helpers/read-web-file");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  try {
    const urlPath = req.url.split("?")[0];
    const content = readWebFile(urlPath);
    if (content === null) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    const { buffer, mimeType } = content;
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(buffer);
  } catch (error) {
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error");
  }
});

module.exports = function () {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
  server.on("error", (error) => {
    console.error("Server error:", error);
  });
}


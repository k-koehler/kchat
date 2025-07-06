const fs = require("fs");
const path = require("path");
const LruCache = require("./lru-cache");

const cache = new LruCache(1000);

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

function readWebFile(url) {
  url ||= "/";
  if (url === "/") {
    url = "index.html";
  }
  const extension = path.extname(url);
  if (extension === "") {
    url += ".html";
  }
  const filePath = path.join("web", url);
  const cachedBuffer = cache.get(filePath);
  if (cachedBuffer) {
    return {
      buffer: cachedBuffer,
      mimeType: getMimeType(filePath),
    };
  }
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  cache.set(filePath, buffer);
  return {
    buffer: buffer,
    mimeType: getMimeType(filePath),
  };
}

module.exports = readWebFile;

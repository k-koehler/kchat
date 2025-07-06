const fs = require("fs");

const QUEUE_WRITER_TIMEOUT = 200; // milliseconds

class QueueWriter {
  static #queuedWrites = [];

  static async #run() {
    while (true) {
      while (this.#queuedWrites.length > 0) {
        const { fn, data } = this.#queuedWrites.shift();
        fs.writeFileSync(fn, JSON.stringify(data, null, 2), "utf8");
      }
      await new Promise(resolve => setTimeout(resolve, QUEUE_WRITER_TIMEOUT));
    }
  }

  static {
    QueueWriter.#run();
  }


  static write(fn, data) {
    this.#queuedWrites.push({
      fn,
      data,
    });
  }
}

module.exports = function (filePath) {
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return new Proxy(
    {},
    {
      get(_, prop) {
        return data[prop];
      },
      set(_, prop, value) {
        Object.assign(data, { [prop]: value });
        QueueWriter.write(filePath, data);
        return true;
      }
    });
}
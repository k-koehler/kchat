const fs = require("fs");
const readline = require("readline");
const uuid = require("./helpers/uuid");

const opType = {
  INSERT: "insert",
  UPDATE: "update",
  DELETE: "delete",
};

class Op {
  constructor(id, type, data = null) {
    this.id = id;
    this.type = type;
    this.data = data;
  }

  serialize() {
    return `${this.id}:${this.type}:${JSON.stringify(this.data)}`;
  }
}

module.exports = class DB {
  #lastProcessed;
  #lastMutated = 0;
  #jsonCache;
  #json() {
    if (this.#jsonCache && this.#lastProcessed >= this.#lastMutated) {
      return this.#jsonCache;
    }
    const fileStream = fs.createReadStream(this.fn);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const json = {};
    rl.on("line", (line) => {
      if (!line.trim()) {
        return;
      }
      const [id, type, ...dataMaybeSplit] = line.split(":");
      const data = dataMaybeSplit.join(":");
      switch (type) {
        case opType.INSERT:
          json[id] = JSON.parse(data);
          break;
        case opType.UPDATE:
          if (!json[id]) {
            break;
          }
          json[id] = { ...json[id], ...JSON.parse(data) };
          break;
        case opType.DELETE:
          delete json[id];
          break;
      }
    });
    return new Promise((resolve) => {
      rl.on("close", () => {
        this.#jsonCache = json;
        this.#lastProcessed = Date.now();
        resolve(json);
      });
    });
  }

  async #writeOp(op) {
    const serialized = op.serialize();
    fs.appendFileSync(this.fn, serialized + "\n");
    this.#lastMutated = Date.now();
  }

  constructor(fn) {
    this.fn = fn;
    if (!fs.existsSync(fn)) {
      fs.writeFileSync(fn, "");
    }
  }

  async insert(data) {
    const id = uuid();
    const op = new Op(id, opType.INSERT, data);
    this.#writeOp(op);
    return id;
  }

  async update(id, data) {
    const op = new Op(id, opType.UPDATE, data);
    this.#writeOp(op);
  }

  async delete(id) {
    const op = new Op(id, opType.DELETE);
    this.#writeOp(op);
  }

  async select(id) {
    const json = await this.#json();
    return {
      id,
      ...json[id],
    };
  }

  async selectAll() {
    const json = await this.#json();
    return Object.entries(json).map(([id, data]) => ({ id, ...data }));
  }

  async selectWhere(predicate) {
    const results = await this.selectAll();
    return results.filter(predicate);
  }

  async selectWhereOne(predicate) {
    const results = await this.selectWhere(predicate);
    return results[0];
  }
};

const fs = require("fs");
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
  get #json() {
    if (this.#jsonCache && this.#lastProcessed >= this.#lastMutated) {
      return this.#jsonCache;
    }
    const lines = fs.readFileSync(this.fn, "utf-8").split("\n");
    const json = {};
    for (const line of lines) {
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
          json[id] = JSON.parse(data);
          break;
        case opType.DELETE:
          delete json[id];
          break;
      }
    }
    this.#jsonCache = json;
    this.#lastProcessed = Date.now();
    return json;
  }

  #writeOp(op) {
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

  insert(data) {
    const id = uuid();
    const op = new Op(id, opType.INSERT, data);
    this.#writeOp(op);
    return id;
  }

  update(id, data) {
    const op = new Op(id, opType.UPDATE, data);
    this.#writeOp(op);
  }

  delete(id) {
    const op = new Op(id, opType.DELETE);
    this.#writeOp(op);
  }

  select(id) {
    return {
      id,
      ...this.#json[id],
    };
  }

  selectAll() {
    return Object.entries(this.#json).map(([id, data]) => ({ id, ...data }));
  }

  selectWhere(predicate) {
    return this.selectAll().filter(predicate);
  }

  selectWhereOne(predicate) {
    const results = this.selectWhere(predicate);
    return results[0];
  }
};

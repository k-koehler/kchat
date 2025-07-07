const sha256 = require("../helpers/sha256");
const uuid = require("../helpers/uuid");
const DB = require("../db");
const serverKeyDb = new DB("data/auth-serverKey.db");
const usersDb = new DB("data/auth-users.db");

function serializeUser(user) {
  const clone = { ...user };
  delete clone.password;
  return clone;
}

if (!serverKeyDb.selectWhereOne(() => true)) {
  const newKey = uuid();
  serverKeyDb.insert({ key: newKey });
}
if (!usersDb.selectWhereOne((user) => user.username === "admin")) {
  usersDb.insert({
    username: "admin",
    password: sha256("admin"),
    createdAt: new Date().toISOString(),
  });
}

module.exports = function auth() {
  const serverKey = serverKeyDb.selectWhereOne(() => true).key;

  function login(username, password) {
    const user = usersDb.selectWhereOne((u) => u.username === username);
    if (!user || user.password !== sha256(password)) {
      return false;
    }
    return `${sha256(serverKey)}.${user.id}`;
  }

  function checkSession(sessionId) {
    const [signature, id] = sessionId.split(".");
    if (sha256(serverKey) !== signature) {
      return false;
    }
    return usersDb.select(id);
  }

  function findUsers() {
    return usersDb.selectAll().map(serializeUser);
  }

  function addUser({ username, password }) {
    if (usersDb.selectWhereOne((user) => user.username === username)) {
      throw new Error("User already exists");
    }
    const id = usersDb.insert({
      username,
      password: sha256(password),
      createdAt: new Date().toISOString(),
    });
    return serializeUser(usersDb.select(id));
  }

  function removeUser(id) {
    usersDb.delete(id);
  }

  return {
    login,
    checkSession,
    findUsers,
    addUser,
    removeUser,
  };
};

const sha256 = require("../helpers/sha256");
const uuid = require("../helpers/uuid");
const DB = require("../db");
const serverKeyDb = new DB("data/auth-serverKey.db");
const usersDb = new DB("data/auth-users.db");

// interface User {
//   id: string;
//   username: string;
//   password: string;
//   createdAt: string;
// }

// interface ServerKey {
//   key: string;
// }

function serializeUser(user) {
  const clone = { ...user };
  delete clone.password;
  return clone;
}

module.exports = function auth() {
  async function createInitialUser() {
    if (await usersDb.selectWhereOne((user) => user.username === "admin")) {
      return;
    }
    await usersDb.insert({
      username: "admin",
      password: sha256("admin"),
      createdAt: new Date().toISOString(),
    });
  }

  async function getServerKey() {
    const keyEntry = await serverKeyDb.selectWhereOne(() => true);
    if (!keyEntry) {
      const newKey = uuid();
      await serverKeyDb.insert({ key: newKey });
      return newKey;
    }
    return keyEntry.key;
  }

  async function login(username, password) {
    const user = await usersDb.selectWhereOne((u) => u.username === username);
    if (!user || user.password !== sha256(password)) {
      return false;
    }
    return `${sha256(await getServerKey())}.${user.id}`;
  }

  async function checkSession(sessionId) {
    const [signature, id] = sessionId.split(".");
    if (sha256(await getServerKey()) !== signature) {
      return false;
    }
    return usersDb.select(id);
  }

  async function findUsers() {
    return (await usersDb.selectAll()).map(serializeUser);
  }

  async function addUser({ username, password }) {
    if (await usersDb.selectWhereOne((user) => user.username === username)) {
      throw new Error("User already exists");
    }
    const id = await usersDb.insert({
      username,
      password: sha256(password),
      createdAt: new Date().toISOString(),
    });
    return serializeUser(await usersDb.select(id));
  }

  async function removeUser(id) {
    return usersDb.delete(id);
  }

  return {
    login,
    createInitialUser,
    checkSession,
    findUsers,
    addUser,
    removeUser,
  };
};

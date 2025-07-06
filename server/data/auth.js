const persistedJson = require("../helpers/persisted-json");
const sha256 = require("../helpers/sha256");
const uuid = require("../helpers/uuid");
const authJson = persistedJson("data/auth.json");

module.exports = function auth() {
  if (!authJson.initialized) {
    authJson.users = {
      admin: {
        password: sha256("admin"),
        createdAt: new Date().toISOString(),
      },
    }
    authJson.serverKey = uuid();
    authJson.initialized = true;
  }

  function login(username, password) {
    if (authJson.users[username]?.password !== sha256(password)) {
      return false;
    }
    return `${sha256(authJson.serverKey)}.${username}`
  }

  function checkSession(sessionId) {
    const [signature, username] = sessionId.split(".");
    if (!sha256(authJson.serverKey) === signature) {
      return false;
    }
    return username;
  }

  function findUsers() {
    return Object.keys(authJson.users).map(username => ({
      username,
      createdAt: authJson.users[username].createdAt,
    }));
  }

  function addUser(username, password) {
    if (authJson.users[username]) {
      throw new Error("User already exists");
    }
    authJson.users = {
      ...authJson.users,
      [username]: {
        password: sha256(password),
        createdAt: new Date().toISOString(),
      },
    };
    return authJson.users[username];
  }

  function removeUser(username) {
    if (!authJson.users[username]) {
      throw new Error("User does not exist");
    }
    if (Object.keys(authJson.users).length <= 1) {
      throw new Error("Cannot remove the last user");
    }
    const users = authJson.users;
    delete users[username];
    authJson.users = users;
  }

  return {
    login,
    checkSession,
    findUsers,
    addUser,
    removeUser,
  };
}
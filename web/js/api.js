export const apiServer = "http://localhost:3001"

export function findUsers() {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "findUsers",
      data: {},
    }),
  })
}

export function findConnections() {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "findConnections",
      data: {},
    }),
  })
}

export function findModels() {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "findModels",
      data: {},
    }),
  })
}

export function findFavouriteModel() {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "findFavouriteModel",
      data: {},
    }),
  })
}

export function setFavouriteModel(connectionId, modelId) {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "setFavouriteModel",
      data: { connectionId, modelId },
    }),
  })
}

export function addConnection(name, host, key) {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "addConnection",
      data: { name, host, key },
    }),
  })
}

export function addUser(username, password) {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "addUser",
      data: { username, password },
    }),
  })
}

export function removeUser(username) {
  return fetch(apiServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kchat-token": localStorage.getItem("token"),
    },
    body: JSON.stringify({
      topic: "removeUser",
      data: { username },
    }),
  })
}

export function login(username, password) {
  return fetch(apiServer, {
    body: JSON.stringify({
      topic: "login",
      data: {
        username,
        password,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}
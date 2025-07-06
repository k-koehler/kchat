import { addUser, findConnections, addConnection } from "../api.js";
import { onVisible, createdAtToDate, openModal, closeModal, isValidUrl } from "../lib.js";

const connectionsEmpty = `
<span style="margin-top: 1rem;" id="connection-list-empty">
  No connections found. Add a connection to get started
</span>
`;

const listItem = `
<div
  data-id="{{id}}"
  style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 1rem;">
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <span>{{name}} ({{host}})</span>
    <span style="font-size: 0.75rem;">{{createdAt}}</span>
  </div>
  <div>
    <span style="color:var(--primary-color);" class="clickable-span"> ✎ </span>
    <span style="color:var(--error-color);" class="clickable-span"> 🗑 </span
    </div>
</div>
`;

function addConnectionToList(connection) {
  const list = document.getElementById("connection-list-content");
  const emptyMessage = document.getElementById("connection-list-empty");
  if (emptyMessage) {
    emptyMessage.remove();
  }
  let html = listItem;
  html = html.replace(/{{id}}/g, connection.id);
  html = html.replace(/{{name}}/g, connection.name);
  html = html.replace(/{{host}}/g, connection.host);
  html = html.replace(/{{createdAt}}/g, createdAtToDate(connection.createdAt));
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const elem = tempDiv.firstElementChild;
  list.appendChild(elem);
}

function removeConnectionFromList(id) {
  const list = document.getElementById("connection-list-content");
  const items = list.querySelectorAll('[data-id]');
  for (const item of items) {
    if (item.getAttribute('data-id') === id) {
      list.removeChild(item);
      return;
    }
  }
  if (list.children.length === 0) {
    list.innerHTML = connectionsEmpty;
  }
}

onVisible("settings-mcontent-connections", async () => {
  const users = await (await findConnections()).json();
  const loading = document.getElementById("connection-list-loading");
  const list = document.getElementById("connection-list-content");
  if (users.length === 0) {
    list.innerHTML = connectionsEmpty;
  } else {
    list.innerHTML = "";
    for (const connection of users) {
      addConnectionToList(connection);
    }
  }
  loading.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-connection-button").addEventListener("click", () => {
    openModal("settings-add-connection-modal");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-connection-cancel-button").addEventListener("click", () => {
    closeModal("settings-add-connection-modal");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-connection-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("settings-add-connection-name").value;
    const host = document.getElementById("settings-add-connection-url").value;
    const key = document.getElementById("settings-add-connection-key").value;
    const errorMessage = document.getElementById("settings-add-connection-error-message");
    const buttonText = document.getElementById("settings-add-connection-submit-button-text");
    const buttonLoading = document.getElementById("settings-add-connection-submit-button-loading");
    errorMessage.style.display = "none";
    if (!name || !host) {
      errorMessage.innerText = "Name and host are required";
      errorMessage.style.display = "block";
      return;
    }
    if (!isValidUrl(host)) {
      errorMessage.innerText = "Invalid URL format";
      errorMessage.style.display = "block";
      return;
    }
    try {
      buttonText.style.display = "none";
      buttonLoading.style.display = "inline-block";
      const response = await addConnection(name, host, key);
      if (!response.ok) {
        const errorData = await response.json();
        errorMessage.innerText = errorData.error || "Failed to add connection";
        errorMessage.style.display = "block";
        return;
      }
      const connection = await response.json();
      addConnectionToList(connection);
      closeModal("settings-add-connection-modal");
    } catch (error) {
      console.error("Error adding connection:", error);
      errorMessage.innerText = "An unexpected error occurred. Please try again";
      errorMessage.style.display = "block";
    } finally {
      buttonText.style.display = "inline-block";
      buttonLoading.style.display = "none";
    }
  });
});
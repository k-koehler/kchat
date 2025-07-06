import { addUser, findUsers, removeUser } from "../api.js";
import { onVisible, createdAtToDate, openModal, closeModal } from "../lib.js";

const listItem = `
<div
  data-username="{{username}}"
  style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 1rem;">
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <span>{{username}}</span>
    <span style="font-size: 0.75rem;">{{createdAt}}</span>
  </div>
  <div>
    <span style="color:var(--primary-color);" class="clickable-span"> ✎ </span>
    <span style="color:var(--error-color);" class="clickable-span">
      🗑
    </span>
  </div>
</div>
`;

function addUserToList(user) {
  const list = document.getElementById("user-list-content");
  let html = listItem;
  html = html.replace(/{{username}}/g, user.username);
  html = html.replace(/{{createdAt}}/g, createdAtToDate(user.createdAt));
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const elem = tempDiv.firstElementChild;
  list.appendChild(elem);
}

function removeUserFromList(username) {
  const list = document.getElementById("user-list-content");
  const items = list.querySelectorAll('[data-username]');
  for (const item of items) {
    if (item.getAttribute('data-username') === username) {
      list.removeChild(item);
      return;
    }
  }
}

onVisible("settings-mcontent-users", async () => {
  const users = await (await findUsers()).json();
  const loading = document.getElementById("user-list-loading");
  for (const user of users) {
    addUserToList(user);
  }
  loading.style.display = "none";
});


document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-user-button").addEventListener("click", () => {
    openModal("settings-add-user-modal");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-user-cancel-button").addEventListener("click", () => {
    closeModal("settings-add-user-modal");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("settings-add-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("settings-add-user-username").value;
    const password = document.getElementById("settings-add-user-password").value;
    const passwordConfirm = document.getElementById("settings-add-user-password-confirm").value;
    const errorMessage = document.getElementById("settings-add-user-error-message");
    const buttonText = document.getElementById("settings-add-user-submit-button-text");
    const buttonLoading = document.getElementById("settings-add-user-submit-button-loading");
    errorMessage.style.display = "none";
    if (password.length < 8) {
      errorMessage.innerText = "Password must be at least 8 characters long"
      errorMessage.style.display = "block";
      return;
    }
    if (password !== passwordConfirm) {
      errorMessage.innerText = "Passwords do not match";
      errorMessage.style.display = "block";
      return;
    }
    try {
      buttonText.style.display = "none";
      buttonLoading.style.display = "inline-block";
      const response = await addUser(username, password);
      if (!response.ok) {
        const errorData = await response.json();
        errorMessage.innerText = errorData.error || "Failed to add user";
        errorMessage.style.display = "block";
        return;
      }
      addUserToList({
        username: username,
        createdAt: new Date().toISOString(),
      });
      closeModal("settings-add-user-modal");
    } catch (error) {
      console.error("Error adding user:", error);
      errorMessage.innerText = "An unexpected error occurred. Please try again";
      errorMessage.style.display = "block";
    } finally {
      buttonText.style.display = "inline-block";
      buttonLoading.style.display = "none";
    }
  });
});


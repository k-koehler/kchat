import { findChatMessages } from "./api.js";
import { messageContentToHtml } from "./message-content-to-html.js";

document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("chat-input");
  const button = document.getElementById("chat-send-button");
  const lineHeight = 22;
  const padding = 16;
  const maxHeight = lineHeight * 10 + padding;
  function updateTextarea() {
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + "px";
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    button.disabled = textarea.value.trim() === "";
  }
  updateTextarea();
  textarea.addEventListener("input", updateTextarea);
});

document.addEventListener("DOMContentLoaded", async function () {
  const chatId = new URLSearchParams(window.location.search).get("id");
  if (!chatId) {
    console.error("Chat ID is required");
    return;
  }
  const response = await findChatMessages(chatId);
  if (!response.ok) {
    console.error("Failed to fetch chat messages:", response.statusText);
    return;
  }
  const messages = await response.json();
  const chatMessagesContainer = document.getElementById("chat-messages");
  for (const message of messages) {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${message.openAiRole === "user" ? "chat-message-user" : "chat-message-assistant"
      }`;
    messageElement.innerHTML = `
      ${message.openAiRole === "assistant" ? `<div style="font-weight: bold; margin-bottom: 1rem;">${message.modelId}</div>` : ''}
      <div class="chat-message-content">${messageContentToHtml(message.content)
      }</div>
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
        <span style="color: var(--text-secondary); font-size: 0.8rem;">${new Date(message.createdAt).toLocaleString()}</span>
        <div style="display: flex; flex-direction: row; gap: 0.5rem; font-size: 1.2rem; margin-left: 1rem;">
          <div>🛈</div>
          <div style="font-size: 1.5rem; margin-top: -4px">⟳</div>
          <div>⧉</div>
        </div>
      </div>
    `;
    chatMessagesContainer.appendChild(messageElement);
  }

});
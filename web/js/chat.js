import { findChatMessages } from "./api.js";

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
  console.log("Chat messages:", messages);
});
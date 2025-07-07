import { findFavouriteModel, findModels, setFavouriteModel } from "./api.js";
import { getMeUsername, openModal, Observable, closeModal } from "./lib.js";

const selectedConnectionModel = new Observable(null);
const favouriteConnectionModel = new Observable(null);

document.addEventListener("DOMContentLoaded", async () => {
  const userLoading = document.getElementById("index-user-loading");
  const userElement = document.getElementById("index-user");
  const userNameElement = document.getElementById("index-user-name");
  const user = getMeUsername();
  userLoading.style.display = "none";
  if (user) {
    userNameElement.textContent = user;
    userElement.style.display = "flex";
  } else {
    userElement.style.display = "none";
  }
});

const connectionHtml = `
 <span class="clickable-span horizontal" id="index-connections">
  <span style="display: block; border-radius: 100%; width: 1rem; height: 1rem; background-color: {{color}};"></span>
  <span>Connected</span>
  </span>
`;

const connectionsListConnectionHtml = `
<div class="vertical">
  <div class="horizontal" style="align-items: center; gap: 0.5rem;">
    <span style="display: block; border-radius: 100%; width: 1rem; height: 1rem; background-color: {{color}};"></span>
    <span>{{connectionName}}</span>
  </div>
  <div class="vertical" style="margin-left: 2rem;" id="index-connection-list-{{connectionId}}-models"></div>
</div>
`;

const modelModalListItemHtml = `
<span class="clickable-span" data-connectionId="{{connectionId}}" data-modelId="{{modelId}}">
  <span class="horizontal" style="align-items: center; gap: 0.5rem;">
        <span id="index-favourite-model-{{connectionId}}-{{modelId}}" data-connectionId="{{connectionId}}" data-modelId="{{modelId}}">★</span>
    <span id="index-select-model-{{connectionId}}-{{modelId}}" class="index-hoverable">{{modelId}}</span>  
  </span>
</span>
`;

document.addEventListener("DOMContentLoaded", async () => {
  const modelsLoading = document.getElementById("index-models-loading");
  const modelsElement = document.getElementById("index-models");
  const models = await (await findModels()).json();
  const activeConnections = models
    .filter((model) => model.models)
    .map((model) => model.name);
  modelsLoading.style.display = "none";
  const connected = activeConnections.length > 0;
  const color = connected ? "green" : "red";
  modelsElement.innerHTML = connectionHtml.replace("{{color}}", color);
  modelsElement.style.display = "flex";
  const connectionsElement = document.getElementById("index-connections");
  connectionsElement.addEventListener("click", () =>
    openModal("index-connections-modal")
  );
  const connectionsList = document.getElementById("index-connections-list");
  for (const { connection, models: connectionModels } of models) {
    const connectionColor = connectionModels ? "green" : "red";
    const connectionHtmlFilled = connectionsListConnectionHtml
      .replace("{{color}}", connectionColor)
      .replace("{{connectionName}}", connection.name)
      .replace("{{connectionId}}", connection.id);
    const connectionElement = document.createElement("div");
    connectionElement.innerHTML = connectionHtmlFilled;
    connectionsList.appendChild(connectionElement);
    const modelsList = connectionElement.querySelector(
      `#index-connection-list-${connection.id}-models`
    );
    const modelModalList = document.getElementById("index-models-modal-list");
    const modelModalListLoading = document.getElementById(
      "index-models-modal-loading"
    );
    if (connectionModels) {
      for (const model of connectionModels) {
        // main model span
        const modelElement = document.createElement("span");
        modelElement.textContent = model.id;
        modelsList.appendChild(modelElement);

        // model modal list items
        const modelModalListItem = modelModalListItemHtml
          .replaceAll("{{connectionId}}", connection.id)
          .replaceAll("{{modelId}}", model.id);
        const modelModalListItemElement = document.createElement("span");
        modelModalListItemElement.innerHTML = modelModalListItem;
        modelModalList.appendChild(modelModalListItemElement);
        modelModalListLoading.style.display = "none";
        modelModalList.style.display = "flex";
        const starSpan = document.getElementById(
          `index-favourite-model-${connection.id}-${model.id}`
        );
        starSpan.addEventListener("click", async (event) => {
          console.log(
            "Clicked star for model:",
            model.id,
            "on connection:",
            connection.id
          );
          favouriteConnectionModel.set({
            connectionId: connection.id,
            modelId: model.id,
          });
        });
        const selectSpan = document.getElementById(
          `index-select-model-${connection.id}-${model.id}`
        );
        selectSpan.addEventListener("click", async (event) => {
          selectedConnectionModel.set({
            connectionId: connection.id,
            modelId: model.id,
          });
          closeModal("index-models-modal");
        });
        if (
          favouriteConnectionModel.value &&
          favouriteConnectionModel.value.connectionId === connection.id &&
          favouriteConnectionModel.value.modelId === model.id
        ) {
          starSpan.textContent = "★";
          starSpan.style.color = "gold";
        }
        if (
          selectedConnectionModel.value &&
          selectedConnectionModel.value.connectionId === connection.id &&
          selectedConnectionModel.value.modelId === model.id
        ) {
          selectSpan.style.fontWeight = "bold";
        }
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const favouriteModel = await (await findFavouriteModel()).json();
  if (favouriteModel) {
    favouriteConnectionModel.set({
      connectionId: favouriteModel.connectionId,
      modelId: favouriteModel.modelId,
    });
    selectedConnectionModel.set({
      connectionId: favouriteModel.connectionId,
      modelId: favouriteModel.modelId,
    });
  }
});

selectedConnectionModel.subscribe((data) => {
  if (!data) {
    return;
  }
  const modelElement = document.getElementById("index-model");
  const modelLoading = document.getElementById("index-model-loading");
  modelLoading.style.display = "none";
  modelElement.textContent = data.modelId;
  modelElement.setAttribute("data-connectionId", data.connectionId);
  modelElement.setAttribute("data-modelId", data.modelId);
  modelElement.style.display = "inline-block";
  const selectSpan = document.getElementById(
    `index-select-model-${data.connectionId}-${data.modelId}`
  );
  if (selectSpan) {
    selectSpan.style.fontWeight = "bold";
    const otherSelectSpans = document.querySelectorAll(
      `#index-models-modal-list span[id^="index-select-model-"]`
    );
    otherSelectSpans.forEach((span) => {
      if (
        span.id !== `index-select-model-${data.connectionId}-${data.modelId}`
      ) {
        span.style.fontWeight = "normal";
      }
    });
  }
});

favouriteConnectionModel.subscribe((data) => {
  if (!data) {
    return;
  }
  setFavouriteModel(data.connectionId, data.modelId);
  const starSpan = document.getElementById(
    `index-favourite-model-${data.connectionId}-${data.modelId}`
  );
  if (starSpan) {
    starSpan.textContent = "★";
    starSpan.style.color = "gold";
    const otherStarSpans = document.querySelectorAll(
      `#index-models-modal-list span[id^="index-favourite-model-"]`
    );
    otherStarSpans.forEach((span) => {
      if (
        span.id !== `index-favourite-model-${data.connectionId}-${data.modelId}`
      ) {
        span.textContent = "☆";
        span.style.color = "var(--text-color)";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modelElement = document.getElementById("index-model");
  modelElement.addEventListener("click", () => openModal("index-models-modal"));
});

document.addEventListener("DOMContentLoaded", () => {
  const inputElement = document.getElementById("index-input");
  const sendButton = document.getElementById("index-send-button");
  const indexForm = document.getElementById("index-form");
  inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
  inputElement.addEventListener("input", () => {
    sendButton.disabled = inputElement.value.trim() === "";
  });
  indexForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    alert("Message sent: " + inputElement.value);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("index-input");
  const button = document.getElementById("index-send-button");
  const form = document.getElementById("index-form");
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

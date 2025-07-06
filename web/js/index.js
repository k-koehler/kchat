import { findFavouriteModel, findModels } from "./api.js";
import { getMeUsername, openModal } from "./lib.js";

document.addEventListener('DOMContentLoaded', async () => {
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
`

document.addEventListener('DOMContentLoaded', async () => {
  const modelsLoading = document.getElementById("index-models-loading");
  const modelsElement = document.getElementById("index-models");
  const models = await (await findModels()).json();
  const activeConnections = models.filter(model => model.models).map(model => model.name);
  modelsLoading.style.display = "none";
  const connected = activeConnections.length > 0;
  const color = connected ? "green" : "red";
  modelsElement.innerHTML = connectionHtml.replace("{{color}}", color);
  modelsElement.style.display = "flex";
  const connectionsElement = document.getElementById("index-connections");
  connectionsElement.addEventListener("click", () => openModal("index-connections-modal"));
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
    const modelsList = connectionElement.querySelector(`#index-connection-list-${connection.id}-models`);
    for (const model of connectionModels) {
      const modelElement = document.createElement("span");
      modelElement.textContent = model.id;
      modelsList.appendChild(modelElement);
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const modelLoading = document.getElementById("index-model-loading");
  const modelElement = document.getElementById("index-model");
  const favouriteModel = await (await findFavouriteModel()).json();
  modelLoading.style.display = "none";
  if (favouriteModel) {
    modelElement.textContent = favouriteModel.modelId;
    modelElement.setAttribute("data-connectionId", favouriteModel.connectionId);
    modelElement.setAttribute("data-modelId", favouriteModel.modelId);
    modelElement.style.display = "inline-block";
  } else {
    modelElement.style.display = "none";
  }
});
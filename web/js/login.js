import { login } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const buttonText = document.getElementById("login-button-text");
    const buttonLoading = document.getElementById("login-button-loading");
    const errorMessage = document.getElementById("login-error-message");
    try {
      buttonText.style.display = "none";
      buttonLoading.style.display = "inline-block";
      errorMessage.style.display = "none";
      const reponse = await login(username, password);
      if (!reponse.ok) {
        errorMessage.textContent = "Invalid username or password";
        errorMessage.style.display = "block";
        return;
      }
      const data = await reponse.json();
      window.localStorage.setItem("token", data.token);
      window.localStorage.setItem("username", username);
      window.location.href = "/"
    } catch (e) {
      console.error("Login failed:", e);
      errorMessage.textContent = "Invalid username or password";
      errorMessage.style.display = "block";
      return;
    } finally {
      buttonText.style.display = "inline-block";
      buttonLoading.style.display = "none";
    }

  });
});
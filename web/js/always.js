document.addEventListener("DOMContentLoaded", () => {

  let token = window.localStorage.getItem("token");
  const guestUrls = [
    "/login.html",
    "/login",
    "/register.html",
    "/register",
    "/forgot-password.html",
    "/forgot-password",
  ];
  if (!token && !guestUrls.includes(window.location.pathname)) {
    window.location.href = "/login";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const nestedBack = document.querySelector(".nested-back");
  if (nestedBack) {
    nestedBack.addEventListener("click", () => {
      window.history.back();
    });
  }
});
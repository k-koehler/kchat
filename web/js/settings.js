function selectItem(item) {
  const contentId = `settings-mcontent-${item}`;
  for (const el of document.querySelectorAll("[id^='settings-mcontent-']")) {
    if (el.id === contentId) {
      el.style.display = "flex";
    } else if (el.style.display !== "none") {
      el.style.display = "none";
    }
  }
  const navItems = document.querySelectorAll(".settings-nav-item");
  for (const navItem of navItems) {
    if (navItem.getAttribute("data-qstring") === item) {
      navItem.style.fontWeight = "bold";
    } else {
      navItem.style.fontWeight = "normal";
    }
  }
  const url = new URL(window.location.href);
  url.searchParams.set("settings", item);
  window.history.replaceState({}, "", url.toString());
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingsParam = urlParams.get("settings");
  if (settingsParam) {
    selectItem(settingsParam);
  } else {
    const firstItem = document.querySelector(".settings-nav-item");
    if (firstItem) {
      selectItem(firstItem.getAttribute("data-qstring"));
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".settings-nav-item");
  for (const navItem of navItems) {
    navItem.addEventListener("click", (event) => {
      event.preventDefault();
      const item = navItem.getAttribute("data-qstring");
      selectItem(item);
    });
  }
});
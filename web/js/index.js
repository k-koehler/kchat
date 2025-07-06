import { getMe } from "./lib.js";

document.addEventListener("DOMContentLoaded", () => {
  const me = getMe();
  if (me) {
    const userLoading = document.getElementById("user-loading");
    userLoading.style.display = "none";
    const user = document.getElementById("user");
    user.textContent = me;
    user.style.display = "block";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const user = document.getElementById('user');
  const menu = document.getElementById('user-menu');

  function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== user) {
      menu.classList.remove('open');
      document.removeEventListener('mousedown', closeMenu);
    }
  }

  user.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = user.getBoundingClientRect();
    menu.style.top = (rect.bottom + window.scrollY) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    const isOpen = menu.classList.toggle('open');
    if (isOpen) {
      menu.style.display = 'flex';
      document.addEventListener('mousedown', closeMenu);
    } else {
      menu.style.display = 'none';
      document.removeEventListener('mousedown', closeMenu);
    }
  });
});
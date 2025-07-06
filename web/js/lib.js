
export function createdAtToDate(createdAt) {
  const date = new Date(createdAt);
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const dateString = date.toLocaleDateString('en-GB', options);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeString = `${hours}:${minutes}${ampm}`;
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysAgo = diffDays === 0 ? 'today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return `${dateString} ${timeString} (${daysAgo})`;
}

export function onVisible(id, cb) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cb();
        observer.disconnect();
      }
    });
  }
  );
  const target = document.getElementById(id);
  if (target) {
    observer.observe(target);
  }
}

function onHidden(id, cb) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        cb();
        observer.disconnect();
      }
    });
  }
  );
  const target = document.getElementById(id);
  if (target) {
    observer.observe(target);
  }
}

export function getMeId() {
  const token = localStorage.getItem("token")
  if (!token) {
    return null
  }
  const [, id] = token.split(".");
  return id;
}

export function getMeUsername() {
  const username = localStorage.getItem("username");
  if (!username) {
    return null;
  }
  return username;
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "block";

    const handleOutsideClick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        modal.removeEventListener('click', handleOutsideClick);
      }
    };
    modal.addEventListener('click', handleOutsideClick);
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        modal.style.display = "none";
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
  }
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
  }
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
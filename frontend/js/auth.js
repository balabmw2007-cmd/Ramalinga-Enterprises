// Talks to the backend's /api/auth routes and keeps a small session in localStorage.
// Change API_BASE_URL to your deployed backend URL when you go live.
const API_BASE_URL = (() => {
  if (window.RAMALINGA_API_BASE_URL) return window.RAMALINGA_API_BASE_URL;
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")
    ) {
      const proto = window.location.protocol === "https:" ? "https:" : "http:";
      return `${proto}//${host}:5000/api`;
    }
    return "https://ramalinga-enterprises-prbq.vercel.app/api";
  }
  return "http://localhost:5000/api";
})();

const Session = {
  get token() {
    return localStorage.getItem("re_token");
  },
  get user() {
    const raw = localStorage.getItem("re_user");
    return raw ? JSON.parse(raw) : null;
  },
  set({ token, user }) {
    localStorage.setItem("re_token", token);
    localStorage.setItem("re_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("re_token");
    localStorage.removeItem("re_user");
  },
  isLoggedIn() {
    return Boolean(this.token);
  },
};

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(Session.token ? { Authorization: `Bearer ${Session.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function showFormMessage(el, message, type = "error") {
  el.textContent = message;
  el.className = `form-msg show ${type}`;
}

function initNavAuthState() {
  const slot = document.getElementById("nav-auth-slot");
  if (!slot) return;

  if (Session.isLoggedIn() && Session.user) {
    const initial = Session.user.name?.[0]?.toUpperCase() || "U";
    slot.innerHTML = `
      <div class="user-pill">
        <span class="avatar">${initial}</span>
        <span>${Session.user.name}</span>
      </div>
      <button id="logout-btn" class="btn btn-ghost">Log out</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => {
      Session.clear();
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Log in</a>
      <a href="register.html" class="btn btn-primary">Sign up</a>
    `;
  }
}

// --- Login page ---
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;
  const msg = document.getElementById("login-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in…";

    try {
      const email = form.email.value.trim();
      const password = form.password.value;
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      Session.set(data);
      showFormMessage(msg, "Welcome back. Redirecting…", "success");
      setTimeout(() => (window.location.href = "products.html"), 600);
    } catch (err) {
      showFormMessage(msg, err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
}

// --- Register page ---
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;
  const msg = document.getElementById("register-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account…";

    try {
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      Session.set(data);
      showFormMessage(msg, "Account created. Redirecting…", "success");
      setTimeout(() => (window.location.href = "products.html"), 600);
    } catch (err) {
      showFormMessage(msg, err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavAuthState();
  initLoginForm();
  initRegisterForm();
});

// ==========================================================================
// Ramalinga Enterprises — main.js
// Handles: nav toggle, product catalog (with images + clickable cards),
//          product detail page, and sign-up modal on action buttons.
// ==========================================================================

// ---------- Image mapping --------------------------------------------------
// Maps product name keywords → image file path (relative to the HTML page).
// Images live in css/ because that is where they were originally uploaded.
const PRODUCT_IMAGE_MAP = [
  { keywords: ["refrigerator", "fridge"],         img: "css/Washing machine, Repair, Servicing in PCMC Near Me +919881647076.jpg" },
  { keywords: ["television", "televisions", "tv", "screens"], img: "css/product-1000x1000.jpeg" },
  { keywords: ["washing", "laundry", "spin pro"],  img: "css/Laundry.jpg" },
  { keywords: ["fan", "breeze", "tower", "desk"],  img: "css/Duo 12 Inch Desk and Handheld Mini Fan.jpg" },
  { keywords: ["microwave", "thermochef", "kitchen", "brew", "coffee", "brewmaster"], img: "css/Modern Kitchen Essentials – Complete Amazon Appliance Collection.jpg" },
  { keywords: ["ac", "air", "airpure", "conditioner", "split"], img: "css/Mitsubishi Air Conditioner.jpg" },
  { keywords: ["coffee", "brew"],                  img: "css/download (1).jpg" },
];
const FALLBACK_IMAGE = "css/household appliance realistic.jpg";

function getProductImage(name) {
  const lower = (name || "").toLowerCase();
  for (const entry of PRODUCT_IMAGE_MAP) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.img;
    }
  }
  return FALLBACK_IMAGE;
}

// ---------- Nav toggle -------------------------------------------------------
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links  = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    links.classList.toggle("mobile-open");
  });

  // Close when tapping any link
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("mobile-open");
    });
  });

  // Close when tapping outside
  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove("mobile-open");
    }
  });
}

function renderStockBadge(stock, isDetail = false) {
  if (stock === undefined || stock === null) {
    return `<span class="stock in">Available</span>`;
  }
  if (typeof stock === "string") {
    const s = stock.toLowerCase().trim();
    if (s.includes("out") || s.includes("unavail") || s === "no" || s === "0") {
      return `<span class="stock out">Out of stock</span>`;
    }
    const label = stock.charAt(0).toUpperCase() + stock.slice(1);
    return `<span class="stock in">${label}</span>`;
  }
  if (typeof stock === "number") {
    if (stock > 0) {
      return isDetail
        ? `<span class="stock in">In stock — ${stock} units available</span>`
        : `<span class="stock in">In stock (${stock})</span>`;
    }
    return `<span class="stock out">Out of stock</span>`;
  }
  return stock ? `<span class="stock in">Available</span>` : `<span class="stock out">Out of stock</span>`;
}

// ---------- Product card HTML (products.html) --------------------------------
function productCardHTML(p) {
  const specs    = Object.entries(p.specs || {})
    .map(([k, v]) => `<span>${k}: ${v}</span>`)
    .join("");
  const imgUrl   = getProductImage(p.name);
  const stars    = "★".repeat(Math.round(p.rating || 0)) + "☆".repeat(5 - Math.round(p.rating || 0));
  const inStock  = renderStockBadge(p.stock);

  return `
    <a href="product-detail.html?id=${encodeURIComponent(p.id)}" class="product-card-link">
      <div class="product-card" style="background-image:url('${imgUrl}');">
        <div class="product-card-overlay">
          <span class="code">${p.id} · ${p.category}</span>
          <h3>${p.name}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="specs">${specs}</div>
          <div class="product-card-footer">
            ${p.price != null && p.price > 0 ? `<div class="price">₹${Number(p.price).toLocaleString("en-IN")}</div>` : ""}
            <div class="rating">${stars}</div>
            ${inStock}
          </div>
        </div>
      </div>
    </a>
  `;
}

// ---------- Product catalog (products.html) ----------------------------------
async function initProductCatalog() {
  const grid      = document.getElementById("product-grid");
  if (!grid) return;
  const filterBar = document.getElementById("product-filter");

  async function load(category) {
    grid.innerHTML = `<p>Loading catalog…</p>`;
    try {
      const qs   = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
      const data = await apiRequest(`/products${qs}`);
      grid.innerHTML =
        data.products.map(productCardHTML).join("") ||
        "<p>No products in this category yet.</p>";
    } catch (err) {
      grid.innerHTML = `<p>Could not reach the catalog service (${err.message}). Is the backend running on ${API_BASE_URL}?</p>`;
    }
  }

  if (filterBar) {
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      load(btn.dataset.category);
    });
  }

  load("All");
}

function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderReviewsHTML(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return `<div class="review-empty"><p>No customer reviews yet. Be the first to share your experience with this appliance!</p></div>`;
  }

  return reviews
    .map((r) => {
      const starCount = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      const starStr = "★".repeat(starCount) + "☆".repeat(5 - starCount);
      const dateStr = r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Recently";
      const initial = (r.name || "Customer").trim().charAt(0).toUpperCase() || "C";

      return `
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-avatar">${initial}</div>
            <div class="review-meta">
              <span class="review-author">${escapeHTML(r.name)}</span>
              <span class="review-date">${dateStr}</span>
            </div>
            <div class="review-rating">${starStr}</div>
          </div>
          <p class="review-comment">${escapeHTML(r.comment)}</p>
        </div>
      `;
    })
    .join("");
}

// ---------- Product detail page (product-detail.html) -----------------------
async function initProductDetail() {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id     = params.get("id");

  if (!id) {
    container.innerHTML = `<p class="detail-error">No product specified. <a href="products.html">Browse catalog →</a></p>`;
    return;
  }

  try {
    const data    = await apiRequest(`/products/${encodeURIComponent(id)}`);
    const p       = data.product;
    const imgUrl  = getProductImage(p.name);
    const specs   = Object.entries(p.specs || {})
      .map(([k, v]) => `<div class="detail-spec"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`)
      .join("");
    const stars   = "★".repeat(Math.round(p.rating || 0)) + "☆".repeat(5 - Math.round(p.rating || 0));
    const inStock = renderStockBadge(p.stock, true);

    // Update page title
    document.title = `${p.name} — Ramalinga Enterprises`;

    container.innerHTML = `
      <div class="detail-hero" style="background-image:url('${imgUrl}');">
        <div class="detail-hero-overlay">
          <span class="eyebrow">${p.category} · ${p.id}</span>
          <h1 class="detail-name">${p.name}</h1>
          ${p.price != null && p.price > 0 ? `<div class="detail-price">₹${Number(p.price).toLocaleString("en-IN")}</div>` : ""}
          <div class="detail-rating">${stars} <span class="rating-num">(${p.rating || 0})</span></div>
          ${inStock}
        </div>
      </div>

      <div class="detail-body">
        <div class="detail-description">
          <h2>About this product</h2>
          <p>${p.description}</p>
        </div>

        ${specs ? `
        <div class="detail-specs-section">
          <h2>Specifications</h2>
          <div class="detail-specs-grid">${specs}</div>
        </div>` : ""}

        <div class="detail-actions">
          <button class="btn btn-primary btn-block signup-trigger">Log in / Sign Up</button>
          <a href="https://wa.me/919363912002?text=${encodeURIComponent(`Hello Ramalinga Enterprises, I am interested in ${p.name} (${p.id})`)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block">💬 WhatsApp contact</a>
          <a href="tel:+919363912002" class="btn btn-ghost btn-block">📞 Call us</a>
          <a href="products.html" class="btn btn-ghost btn-block">← Back to all products</a>
        </div>
      </div>

      <!-- Customer Reviews Section -->
      <section class="reviews-section">
        <div class="reviews-head">
          <div>
            <h2>Customer Reviews & Ratings</h2>
            <p id="reviews-count-text">${(p.reviews || []).length} review${(p.reviews || []).length === 1 ? "" : "s"} · Rating: <span class="rating-highlight">${p.rating || 0}/5</span></p>
          </div>
        </div>

        <div class="reviews-layout">
          <div class="reviews-list" id="reviews-list">
            ${renderReviewsHTML(p.reviews)}
          </div>

          <div class="review-form-box">
            <h3>Write a Review</h3>
            <p>Share your experience with this appliance.</p>
            <div id="review-msg" class="form-msg"></div>

            <form id="product-review-form">
              <div class="field">
                <label for="review-name">Your Name</label>
                <input type="text" id="review-name" name="name" required placeholder="e.g. Ramesh Kumar" value="${Session.user?.name || ""}" />
              </div>
              <div class="field">
                <label for="review-rating">Rating</label>
                <select id="review-rating" name="rating" required>
                  <option value="5">★★★★★ (5 - Excellent)</option>
                  <option value="4">★★★★☆ (4 - Very Good)</option>
                  <option value="3">★★★☆☆ (3 - Good)</option>
                  <option value="2">★★☆☆☆ (2 - Fair)</option>
                  <option value="1">★☆☆☆☆ (1 - Poor)</option>
                </select>
              </div>
              <div class="field">
                <label for="review-comment">Your Review / Comments</label>
                <textarea id="review-comment" name="comment" rows="4" required placeholder="Write your review about this appliance..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Submit Review</button>
            </form>
          </div>
        </div>
      </section>
    `;

    // Attach modal trigger to the Buy/Auth button
    const buyBtn = container.querySelector(".signup-trigger");
    if (buyBtn) {
      buyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (Session.isLoggedIn()) {
          alert("You're already signed in! You can proceed to purchase.");
        } else {
          showSignupModal();
        }
      });
    }

    // Attach review submission handler
    const reviewForm = container.querySelector("#product-review-form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = reviewForm.querySelector("button[type=submit]");
        const reviewMsg = container.querySelector("#review-msg");

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";

        try {
          const name = reviewForm.name.value.trim();
          const rating = Number(reviewForm.rating.value);
          const comment = reviewForm.comment.value.trim();

          const result = await apiRequest(`/products/${encodeURIComponent(p.id)}/reviews`, {
            method: "POST",
            body: JSON.stringify({ name, rating, comment }),
          });

          showFormMessage(reviewMsg, "Thank you! Your review has been saved.", "success");
          reviewForm.comment.value = "";

          // Update reviews list immediately
          const listEl = container.querySelector("#reviews-list");
          const updatedReviews = result.reviews || (result.review ? [result.review, ...(p.reviews || [])] : p.reviews || []);
          p.reviews = updatedReviews;
          if (listEl) {
            listEl.innerHTML = renderReviewsHTML(updatedReviews);
          }

          // Update count text
          const countEl = container.querySelector("#reviews-count-text");
          if (countEl) {
            countEl.innerHTML = `${updatedReviews.length} review${updatedReviews.length === 1 ? "" : "s"} · Rating: <span class="rating-highlight">${result.rating != null ? result.rating : p.rating || 0}/5</span>`;
          }

          // Update hero rating
          const heroRating = container.querySelector(".detail-rating");
          if (heroRating && result.rating != null) {
            const newStars = "★".repeat(Math.round(result.rating)) + "☆".repeat(5 - Math.round(result.rating));
            heroRating.innerHTML = `${newStars} <span class="rating-num">(${result.rating})</span>`;
          }
        } catch (err) {
          showFormMessage(reviewMsg, err.message, "error");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Review";
        }
      });
    }
  } catch (err) {
    container.innerHTML = `
      <div class="detail-error">
        <p>Could not load product "${id}". ${err.message}</p>
        <a href="products.html" class="btn btn-ghost">← Browse catalog</a>
      </div>
    `;
  }
}

// ---------- Sign-up modal ----------------------------------------------------
function createSignupModal() {
  if (document.getElementById("signup-modal-overlay")) return; // already exists

  const overlay = document.createElement("div");
  overlay.id    = "signup-modal-overlay";
  overlay.className = "signup-modal-overlay";
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("role", "dialog");

  overlay.innerHTML = `
    <div class="signup-modal">
      <button class="signup-modal-close" aria-label="Close">&times;</button>
      <span class="eyebrow">Account</span>
      <h2>Create your account</h2>
      <p>Sign up to save orders and track service requests.</p>

      <div id="modal-msg" class="form-msg"></div>

      <form id="modal-register-form">
        <div class="field">
          <label for="modal-name">Full name</label>
          <input type="text" id="modal-name" name="name" required autocomplete="name" />
        </div>
        <div class="field">
          <label for="modal-email">Email</label>
          <input type="email" id="modal-email" name="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="modal-password">Password</label>
          <input type="password" id="modal-password" name="password" required minlength="8" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn btn-primary btn-block">Create account</button>
      </form>

      <div class="auth-switch" style="margin-top:16px;">
        Already have an account? <a href="login.html">Log in</a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on overlay backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideSignupModal();
  });

  // Close button
  overlay.querySelector(".signup-modal-close").addEventListener("click", hideSignupModal);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideSignupModal();
  });

  // Form submit — register via API
  const form = overlay.querySelector("#modal-register-form");
  const msg  = overlay.querySelector("#modal-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled   = true;
    submitBtn.textContent = "Creating account…";

    try {
      const name     = form.name.value.trim();
      const email    = form.email.value.trim();
      const password = form.password.value;

      if (password.length < 8) throw new Error("Password must be at least 8 characters.");

      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      Session.set(data);
      showFormMessage(msg, "Account created! Welcome 🎉", "success");
      setTimeout(() => {
        hideSignupModal();
        window.location.href = "products.html";
      }, 1000);
    } catch (err) {
      showFormMessage(msg, err.message, "error");
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = "Create account";
    }
  });
}

function showSignupModal() {
  createSignupModal();
  const overlay = document.getElementById("signup-modal-overlay");
  if (overlay) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function hideSignupModal() {
  const overlay = document.getElementById("signup-modal-overlay");
  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Attach modal to action buttons (btn-primary / btn-ghost) that are NOT
// nav links, NOT the product-card link, and NOT already bound to forms.
function initSignupModalTriggers() {
  // Skip if user is already logged in
  if (Session.isLoggedIn()) return;

  const triggers = document.querySelectorAll(
    "a.btn-primary, a.btn-ghost, button.btn-primary, button.btn-ghost"
  );

  const EXEMPT_HREFS = ["login.html", "register.html", "products.html", "product-detail.html"];

  triggers.forEach((el) => {
    // Exempt nav-auth-slot buttons (handled by auth.js) and form submit buttons
    if (el.closest("#nav-auth-slot")) return;
    if (el.closest("#post-upload-container") || el.id === "toggle-post-form-btn") return;
    if (el.type === "submit") return;

    // Exempt links that go to products, login, register
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (EXEMPT_HREFS.some((h) => href.includes(h))) return;
      if (href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
    }

    el.addEventListener("click", (e) => {
      if (Session.isLoggedIn()) return; // logged-in users pass through
      e.preventDefault();
      showSignupModal();
    });
  });
}

// ---------- Posts & Videos Feed (index.html) --------------------------------
function getMediaFullUrl(mediaUrl) {
  if (!mediaUrl) return "";
  if (
    mediaUrl.startsWith("http://") ||
    mediaUrl.startsWith("https://") ||
    mediaUrl.startsWith("data:")
  ) {
    return mediaUrl;
  }
  const base = (
    typeof API_BASE_URL !== "undefined"
      ? API_BASE_URL
      : (window.location && window.location.hostname
          ? `${window.location.protocol === "https:" ? "https:" : "http:"}//${window.location.hostname}:5000/api`
          : "http://localhost:5000/api")
  ).replace(/\/api\/?$/, "");
  return `${base}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
}

function postCardHTML(post) {
  const mediaUrl = getMediaFullUrl(post.mediaUrl);
  let mediaHTML = "";

  if (
    post.mediaType === "video" ||
    (mediaUrl && mediaUrl.match(/\.(mp4|webm|mov|ogg|m4v)$/i))
  ) {
    mediaHTML = `
      <div class="post-media-box">
        <video src="${mediaUrl}" controls playsinline preload="metadata" class="post-video"></video>
      </div>
    `;
  } else if (
    post.mediaType === "image" ||
    (mediaUrl && mediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i))
  ) {
    mediaHTML = `
      <div class="post-media-box">
        <img src="${mediaUrl}" alt="${escapeHTML(post.title)}" class="post-image" loading="lazy" />
      </div>
    `;
  }

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const tagsHTML =
    Array.isArray(post.tags) && post.tags.length > 0
      ? `<div class="post-tags">${post.tags
          .map((t) => `<span class="post-tag">#${escapeHTML(t)}</span>`)
          .join("")}</div>`
      : "";

  return `
    <article class="post-card">
      ${mediaHTML}
      <div class="post-content">
        <div class="post-meta">
          <span class="post-author">${escapeHTML(post.author || "Ramalinga Enterprises")}</span>
          <span class="post-date">${dateStr}</span>
        </div>
        <h3 class="post-title">${escapeHTML(post.title)}</h3>
        ${post.description ? `<p class="post-desc">${escapeHTML(post.description)}</p>` : ""}
        ${tagsHTML}
      </div>
    </article>
  `;
}

async function initPostsFeed() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

  try {
    const data = await apiRequest("/posts");
    if (!data.posts || data.posts.length === 0) {
      grid.innerHTML = `
        <div class="posts-empty">
          <div class="empty-icon">📺</div>
          <h3>No posts or videos yet</h3>
          <p>Click <strong>+ Upload Post / Video</strong> above to share the first store announcement, video demo, or deal!</p>
        </div>
      `;
      return;
    }
    grid.innerHTML = data.posts.map(postCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `
      <div class="posts-empty">
        <p>Could not load posts feed (${err.message}). Make sure the backend server is running.</p>
      </div>
    `;
  }
}

function initPostUpload() {
  const toggleBtn = document.getElementById("toggle-post-form-btn");
  const formBox = document.getElementById("post-upload-container");
  const closeBtn = document.getElementById("close-post-form-btn");
  const cancelBtn = document.getElementById("cancel-post-btn");
  const form = document.getElementById("post-upload-form");
  const msgBox = document.getElementById("post-upload-msg");
  const grid = document.getElementById("posts-grid");

  if (!toggleBtn || !formBox || !form) return;

  toggleBtn.addEventListener("click", () => {
    const isHidden = formBox.style.display === "none";
    formBox.style.display = isHidden ? "block" : "none";
    if (isHidden) {
      formBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const titleInput = form.querySelector("#post-title");
      if (titleInput) titleInput.focus();
    }
  });

  const closeForm = () => {
    formBox.style.display = "none";
    if (msgBox) {
      msgBox.className = "form-msg";
      msgBox.textContent = "";
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeForm);
  if (cancelBtn) cancelBtn.addEventListener("click", closeForm);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("post-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading…";

    try {
      const formData = new FormData(form);
      if (
        typeof Session !== "undefined" &&
        Session.isLoggedIn() &&
        Session.user &&
        Session.user.name
      ) {
        formData.append("author", Session.user.name);
      }

      const base =
        typeof API_BASE_URL !== "undefined"
          ? API_BASE_URL
          : (window.location && window.location.hostname
              ? `${window.location.protocol === "https:" ? "https:" : "http:"}//${window.location.hostname}:5000/api`
              : "http://localhost:5000/api");
      const headers = {};
      if (typeof Session !== "undefined" && Session.token) {
        headers["Authorization"] = `Bearer ${Session.token}`;
      }

      const res = await fetch(`${base}/posts`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || `Upload failed (${res.status})`);
      }

      showFormMessage(msgBox, "Post published successfully!", "success");
      form.reset();

      if (grid && result.post) {
        const emptyEl = grid.querySelector(".posts-empty");
        if (emptyEl) {
          grid.innerHTML = postCardHTML(result.post);
        } else {
          grid.insertAdjacentHTML("afterbegin", postCardHTML(result.post));
        }
      }

      setTimeout(() => {
        closeForm();
      }, 1500);
    } catch (err) {
      showFormMessage(msgBox, err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish Post";
    }
  });
}

// ---------- Boot -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initProductCatalog();
  initProductDetail();
  initPostsFeed();
  initPostUpload();
  initSignupModalTriggers();
});

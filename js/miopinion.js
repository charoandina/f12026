// ======================= miopinion.js =======================

// Config
const INITIAL_COUNT = 3;
const STEP = 3;

let posts = [];
let shownCount = INITIAL_COUNT; // visible cards count (excluding featured)
let expanded = false;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  // Cache DOM
  const container = document.getElementById("lastOpinionsContainer");
  const toggleBtn = document.getElementById("toggleMoreBtn");
  const toggleText = document.getElementById("toggleMoreText");
  const toggleIcon = document.getElementById("toggleMoreIcon");

  if (!container || !toggleBtn || !toggleText || !toggleIcon) return;

  // Load posts.json
  posts = await loadPosts();
  if (!Array.isArray(posts) || !posts.length) return;

    // Sort by date DESC (supports "dd-mm-yyyy" and "yyyy-mm-dd")
    posts.sort((a, b) => parseESDate(b.fecha) - parseESDate(a.fecha));

    // Render featured post (posts[0])
    renderFeatured(posts[0]);

    // Exclude featured (posts[0]) from this list
    const available = Math.max(0, posts.length - 1);
    shownCount = Math.min(INITIAL_COUNT, available);

    // Initial render
    renderList(container, posts, shownCount);

    // Button behavior
    updateToggleUI(toggleText, toggleIcon, available);

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const availableNow = Math.max(0, posts.length - 1);

    if (!expanded) {
      // Show more (add STEP, clamp to available)
      shownCount = Math.min(shownCount + STEP, availableNow);
      renderList(container, posts, shownCount);

      // If we reached the end, switch to "less"
      if (shownCount >= availableNow) expanded = true;
    } else {
      // Show less (remove STEP, floor to INITIAL_COUNT)
      shownCount = Math.max(shownCount - STEP, INITIAL_COUNT);
      renderList(container, posts, shownCount);

      // If we returned to initial, switch back to "more"
      if (shownCount <= INITIAL_COUNT) expanded = false;
    }

    updateToggleUI(toggleText, toggleIcon, availableNow);
  });
}

function renderFeatured(post) {
  if (!post) return;

  const img = document.getElementById("last_img_post");
  const title = document.getElementById("last_post_title");
  const text = document.getElementById("last_post_text");
  const author = document.getElementById("author");
  const date = document.getElementById("date");
  const link = document.getElementById("featured_link");

  if (!img || !title || !text || !author || !date || !link) return;

  img.src = normalizeImg(post.imagen);
  img.alt = post.titulo;

  title.textContent = post.titulo;

  // ~300 chars + "..."
  text.textContent = truncate(post.excerpt || "", 300);

  author.textContent = `Por ${post.autor}`;

  date.textContent = formatFechaTexto(post.fecha);

  link.href = `/post.html?id=${encodeURIComponent(post.id)}`;
}


async function loadPosts() {
  try {
    // If miopinion.html is at root and JSON is /blog/data/posts.json:
    const res = await fetch("blog/data/posts.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load posts.json:", err);
    return [];
  }
}

function renderList(container, postsArr, count) {
  // We show posts[1..count] (excluding featured at index 0)
  const items = postsArr.slice(1, 1 + count);

  container.innerHTML = items.map((p) => cardHTML(p)).join("");

  // Click on card => go to post template
  // Example: /post.html?id=norris-campeon-del-mundo
  container.querySelectorAll(".last_opinion").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-id");
      window.location.href = `/post.html?id=${encodeURIComponent(id)}`;
    });
  });
}

function cardHTML(p) {
  const excerpt150 = truncate(p.excerpt || "", 150);

  // Build Spanish date text from "fecha"
  // Example input: "09-12-2025" -> "9 de diciembre, 2025"
  const fechaTexto = formatFechaTexto(p.fecha).toUpperCase();

  return `
    <div class="last_opinion" data-id="${escapeAttr(p.id)}">
      <img src="${escapeAttr(normalizeImg(p.imagen))}" alt="${escapeAttr(p.titulo)}">
      <h3>${escapeHTML(p.titulo)}</h3>
      <p class="last_opinion_text">${escapeHTML(excerpt150)}</p>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 2v4"></path><path d="M16 2v4"></path>
          <rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
        </svg>
        <h4>${escapeHTML(fechaTexto)}</h4>
      </div>
    </div>
  `;
}

function updateToggleUI(toggleText, toggleIcon, available) {
  const anchor = toggleText.closest("a");

  // If there are <= INITIAL_COUNT posts available, disable button
  if (available <= INITIAL_COUNT) {
    toggleText.textContent = "MOSTRAR MAS";
    toggleIcon.style.display = "none";
    if (anchor) {
      anchor.style.pointerEvents = "none";
      anchor.style.opacity = "0.4";
    }
    return;
  }

  if (anchor) {
    anchor.style.pointerEvents = "";
    anchor.style.opacity = "";
  }

  toggleIcon.style.display = "";
  toggleIcon.style.transition = "transform 0.2s ease";

  if (!expanded) {
    toggleText.textContent = "MOSTRAR MAS";
    // Arrow down (default)
    toggleIcon.style.transform = "rotate(0deg)";
  } else {
    toggleText.textContent = "MOSTRAR MENOS";
    // Arrow up
    toggleIcon.style.transform = "rotate(180deg)";
  }
}

// Helpers
function truncate(text, max) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "...";
}

function parseESDate(dateStr) {
  // Supports "dd-mm-yyyy" and "yyyy-mm-dd"
  const s = (dateStr || "").trim();

  // dd-mm-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  // Fallback
  return new Date(0);
}

function formatFechaTexto(dateStr) {
  const d = parseESDate(dateStr);
  if (!(d instanceof Date) || isNaN(d)) return "";

  const day = d.getDate(); // no leading zero on purpose
  const month = d.toLocaleString("es-ES", { month: "long" });
  const year = d.getFullYear();

  return `${day} de ${month}, ${year}`;
}

function normalizeImg(path) {
  // Ensure leading slash for root assets
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return "/" + path;
}

function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHTML(str).replaceAll("`", "&#096;");
}

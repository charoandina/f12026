// ======================= post.js =======================
// NOTE: Code comments in English (as requested).

document.addEventListener("DOMContentLoaded", init);

async function init() {
  // 1) Get post id from URL: /post.html?id=...
  const id = getPostIdFromURL();
  if (!id) {
    window.location.href = "miopinion.html";
    return;
  }

  // 2) Load metadata from posts.json
  const meta = await loadPostMeta(id);
  if (!meta) {
    renderNotFound(id);
    return;
  }

  // 3) Hydrate top section
  hydrateMeta(meta);

  // 4) Load article HTML content
  const html = await loadPostContent(id);
  if (!html) {
    renderContentMissing(id);
    return;
  }

  // 5) Inject HTML
  hydrateContent(html);

  // 6) Back button
  wireBackButton();

  // 7) Render last 3 opinions (excluding current post)
  renderLastOpinions(id);
}

// ------------------------------------------------------
// Core loaders
// ------------------------------------------------------

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("id") || "").trim();
}

async function loadPostMeta(id) {
  const candidates = ["blog/data/posts.json", "/blog/data/posts.json"];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data)) return null;
      return data.find(p => p && p.id === id) || null;
    } catch (err) {
      // try next
    }
  }
  console.error("Failed to load posts.json from any candidate");
  return null;
}

async function loadPostContent(id) {
  const candidates = [`blog/content/${encodeURIComponent(id)}.html`, `/blog/content/${encodeURIComponent(id)}.html`];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.text();
    } catch (err) {
      // try next
    }
  }
  console.error(`Failed to load post content for id=${id}`);
  return "";
}

async function loadAllPosts() {
  const candidates = ["blog/data/posts.json", "/blog/data/posts.json"];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch (err) {
      // try next
    }
  }
  return [];
}

// ------------------------------------------------------
// Hydration
// ------------------------------------------------------

function hydrateMeta(meta) {
  const titleEl = document.getElementById("title");
  const authorEl = document.getElementById("author");
  const dateEl = document.getElementById("date");
  const imageEl = document.getElementById("image");

  const title = meta.titulo || "Nota";
  const author = meta.autor || "";
  const dateText = meta.fecha_texto || formatFechaTexto(meta.fecha);
  const img = normalizeImg(meta.imagen);

  document.title = `Telemetrico - ${title}`;

  if (titleEl) titleEl.textContent = title;
  if (authorEl) authorEl.textContent = author;
  if (dateEl) dateEl.textContent = dateText;

  if (imageEl) {
    imageEl.src = img;
    imageEl.alt = title;
  }
}

function hydrateContent(html) {
  const contentEl = document.getElementById("content");
  if (!contentEl) return;
  contentEl.innerHTML = html;
}

// ------------------------------------------------------
// Last opinions (post page)
// ------------------------------------------------------

async function renderLastOpinions(currentId) {
  const container = document.getElementById("postLastOpinions");
  if (!container) return;

  const posts = await loadAllPosts();
  if (!posts.length) return;

  // Order by newest first
  posts.sort((a, b) => parseESDate(b.fecha) - parseESDate(a.fecha));

  // Exclude current post
  const filtered = posts.filter(p => p.id !== currentId);

  // Take first 3
  const lastThree = filtered.slice(0, 3);

  container.innerHTML = lastThree.map(p => lastOpinionCardHTML(p)).join("");

  container.querySelectorAll(".last_opinion").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      window.location.href = `/post.html?id=${encodeURIComponent(id)}`;
    });
  });
}

function lastOpinionCardHTML(p) {
  return `
    <div class="last_opinion" data-id="${escapeHTML(p.id)}">
      <img src="${normalizeImg(p.imagen)}" alt="${escapeHTML(p.titulo)}">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 2v4"></path>
          <path d="M16 2v4"></path>
          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
          <path d="M3 10h18"></path>
        </svg>
        <h4>${formatFechaTexto(p.fecha)}</h4>
      </div>
      <h3>${escapeHTML(p.titulo)}</h3>
    </div>
  `;
}

// ------------------------------------------------------
// UI helpers
// ------------------------------------------------------

function wireBackButton() {
  const backBtn = document.querySelector(".back-btn button");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/miopinion.html";
  });
}

function renderNotFound(id) {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");

  if (titleEl) titleEl.textContent = "Nota no encontrada";
  if (contentEl) {
    contentEl.innerHTML = `
      <p>No existe una nota con id: <strong>${escapeHTML(id)}</strong>.</p>
      <p><a href="miopinion.html">Volver a Mi Opinión</a></p>
    `;
  }
}

function renderContentMissing(id) {
  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  contentEl.innerHTML = `
    <p>Encontré la nota en el JSON, pero falta el archivo:</p>
    <p><code>blog/content/${escapeHTML(id)}.html</code></p>
    <p><a href="miopinion.html">Volver a Mi Opinión</a></p>
  `;
}

// ------------------------------------------------------
// Utils
// ------------------------------------------------------

function normalizeImg(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Use relative paths for GitHub Pages (strip leading slash if present)
  return path.startsWith("/") ? path.slice(1) : path;
}

function parseESDate(dateStr) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(0);
}

function formatFechaTexto(dateStr) {
  const d = parseESDate(dateStr);
  return `${d.getDate()} de ${d.toLocaleString("es-ES", { month: "long" })}, ${d.getFullYear()}`;
}

function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================= index-posts.js =======================

document.addEventListener("DOMContentLoaded", initIndexPosts);

async function initIndexPosts() {
  const featuredImg = document.getElementById("last_img_post");
  const featuredTitle = document.getElementById("last_post_title");
  const featuredText = document.getElementById("last_post_text");
  const featuredAuthor = document.getElementById("author");
  const featuredDate = document.getElementById("date");
  const featuredLink = document.getElementById("featured_link");

  const listContainer = document.getElementById("homeLastOpinions");

  if (!featuredImg || !featuredTitle || !featuredText || !featuredAuthor || !featuredDate || !featuredLink || !listContainer) {
    return;
  }

  const posts = await loadPosts();
  if (!posts.length) return;

  // Order by newest first
  posts.sort((a, b) => parseESDate(b.fecha) - parseESDate(a.fecha));

  // ===== FEATURED =====
  const featured = posts[0];

  featuredImg.src = normalizeImg(featured.imagen);
  featuredImg.alt = featured.titulo;

  featuredTitle.textContent = featured.titulo;
  featuredText.textContent = truncate(featured.excerpt || "", 300);
  featuredAuthor.textContent = `Por ${featured.autor}`;
  featuredDate.textContent = formatFechaTexto(featured.fecha);
  featuredLink.href = `post.html?id=${encodeURIComponent(featured.id)}`;

  // ===== LAST 3 =====
  const lastThree = posts.slice(1, 4);

  listContainer.innerHTML = lastThree.map(post => cardHTML(post)).join("");

  listContainer.querySelectorAll(".last_opinion").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      window.location.href = `post.html?id=${encodeURIComponent(id)}`;
    });
  });
}

// ======================= helpers =======================

async function loadPosts() {
  // Try relative path first, then absolute-from-root for different hosting setups
  const candidates = ["blog/data/posts.json", "/blog/data/posts.json"];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch (e) {
      // try next
    }
  }
  return [];
}

function cardHTML(p) {
  return `
    <div class="last_opinion" data-id="${escapeAttr(p.id)}">
      <img src="${escapeAttr(normalizeImg(p.imagen))}" alt="${escapeAttr(p.titulo)}">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 2v4"></path><path d="M16 2v4"></path>
          <rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
        </svg>
        <h4>${formatFechaTexto(p.fecha)}</h4>
      </div>
      <h3>${escapeHTML(p.titulo)}</h3>
    </div>
  `;
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
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

function normalizeImg(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Use relative paths for GitHub Pages (strip leading slash if present)
  return path.startsWith("/") ? path.slice(1) : path;
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(str) {
  return escapeHTML(str).replaceAll('"', "&quot;");
}

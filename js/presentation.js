// ======================= presentations.js =======================
document.addEventListener("DOMContentLoaded", () => {
  initPresentations();
});

function initPresentations() {
  const teamsWrap = document.querySelector(".presentations .teams");
  const presentationInfo = document.querySelector(".presentation_info");

  if (!teamsWrap || !presentationInfo) return;

  // UI targets
  const teamEl = document.getElementById("presentation_team");
  const dateEl = document.getElementById("presentation_date");
  const presentationImg = document.querySelector(".presentation_img");

  // Presentation data (2026)
  const PRESENTATIONS = {
    "red bull": { 
      iso: "2026-01-15", 
      class: "redbull",
      images: [
        "img/presentation/redbull-car-1.webp",
        "img/presentation/redbull-car-2.webp",
        "img/presentation/redbull-car-3.webp",
        "img/presentation/redbull-car-4.webp"
      ]
    },
    "racing bulls": { 
      iso: "2026-01-15", 
      class: "racingbulls",
      images: [
        "img/presentation/rb-car-1.webp",
        "img/presentation/rb-car-2.webp",
        "img/presentation/rb-car-3.webp"
      ]
    },
    "haas": { iso: "2026-01-19", class: "haas" },
    "audi": { iso: "2026-01-20", class: "audi" },
    "mercedes": { iso: "2026-01-22", class: "mercedes" },
    "alpine": { iso: "2026-01-23", class: "alpine" },
    "ferrari": { iso: "2026-01-23", class: "ferrari" },
    "williams": { iso: "2026-02-03", class: "williams" },
    "cadillac": { iso: "2026-02-08", class: "cadillac" },
    "mclaren": { iso: "2026-02-09", class: "mclaren" },
    "aston martin": { iso: "2026-02-09", class: "astonmartin" }
  };

  // Normalize team names from DOM
  const norm = (s) => String(s || "").trim().toLowerCase();

  // Create a Date at local midnight (safer day difference)
  function toLocalMidnight(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  // Format date in Spanish: "15 de enero"
  function formatEsShort(iso) {
    const d = toLocalMidnight(iso);
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${d.getDate()} de ${months[d.getMonth()]}`;
  }

  // Calculate remaining days from today
  function daysUntil(iso) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = toLocalMidnight(iso);
    return Math.max(0, Math.round((target - today) / 86400000));
  }

  // Remove all team background classes
  function clearTeamBackgrounds() {
    Object.values(PRESENTATIONS).forEach(t =>
      presentationInfo.classList.remove(t.class)
    );
  }

  // Show images gallery or countdown
  function renderImages(images, days, teamName) {
    if (!images || images.length === 0) {
      // No hay imágenes, mostrar countdown
      presentationImg.innerHTML = `
        <h3>CUENTA REGRESIVA</h3>
        <div>
          <p>${days}</p>
          <span>${days === 1 ? 'día' : 'días'}</span>
        </div>
      `;
      return;
    }

    // Hay imágenes, crear galería
    let galleryHTML = '<div class="image-gallery">';
    
    images.forEach((imgSrc, index) => {
      galleryHTML += `
        <div class="gallery-item ${index === 0 ? 'active' : ''}">
          <img src="${imgSrc}" alt="${teamName} - Imagen ${index + 1}" loading="lazy">
        </div>
      `;
    });

    // Agregar controles si hay más de una imagen
    if (images.length > 1) {
      galleryHTML += `
        <button class="gallery-prev" aria-label="Anterior">‹</button>
        <button class="gallery-next" aria-label="Siguiente">›</button>
        <div class="gallery-dots">
          ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      `;
    }

    galleryHTML += '</div>';
    presentationImg.innerHTML = galleryHTML;

    // Inicializar controles de galería
    if (images.length > 1) {
      initGalleryControls(images.length);
    }
  }

  // Controles de galería
  function initGalleryControls(totalImages) {
    let currentIndex = 0;
    const items = presentationImg.querySelectorAll('.gallery-item');
    const dots = presentationImg.querySelectorAll('.dot');
    const prevBtn = presentationImg.querySelector('.gallery-prev');
    const nextBtn = presentationImg.querySelector('.gallery-next');

    function showImage(index) {
      items.forEach(item => item.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      items[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
    }

    prevBtn.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + totalImages) % totalImages;
      showImage(newIndex);
    });

    nextBtn.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % totalImages;
      showImage(newIndex);
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        showImage(parseInt(dot.dataset.index));
      });
    });

     Auto-play 
     setInterval(() => {
      const newIndex = (currentIndex + 1) % totalImages;
     showImage(newIndex);
     }, 5000);
  }

  // Render UI for selected team
  function render(teamName) {
    const data = PRESENTATIONS[norm(teamName)];
    if (!data) return;

    teamEl.textContent = teamName;
    dateEl.textContent = formatEsShort(data.iso);

    const days = daysUntil(data.iso);

    clearTeamBackgrounds();
    presentationInfo.classList.add(data.class);

    // Mostrar imágenes o countdown
    renderImages(data.images, days, teamName);
  }

  // Handle team click
  teamsWrap.addEventListener("click", (e) => {
    const teamBox = e.target.closest(".team");
    if (!teamBox) return;

    const teamName = teamBox.querySelector("p")?.textContent;
    if (!teamName) return;

    // Active state
    teamsWrap.querySelectorAll(".team").forEach(t =>
      t.classList.remove("active")
    );
    teamBox.classList.add("active");

    render(teamName);
  });

  // Initial state (Red Bull)
  render("red bull");

  const initialTeam = [...teamsWrap.querySelectorAll(".team")]
    .find(t => norm(t.querySelector("p")?.textContent) === "red bull");

  if (initialTeam) initialTeam.classList.add("active");
}
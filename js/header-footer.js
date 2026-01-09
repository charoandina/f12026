// ==========================
// HAMBURGER MENU (mobile)
// ==========================
function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".menu-wrapper");
  const menuLinks = document.querySelectorAll(".menu-wrapper a");

  if (!hamburger || !menu) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menu.classList.toggle("is-open");
  });

  menuLinks.forEach(link => {
    link.addEventListener("click", e => {
      // If submenu toggle on mobile → don't close menu
      if (
        link.classList.contains("submenu-toggle") &&
        window.innerWidth <= 900
      ) {
        e.preventDefault();
        return;
      }

      hamburger.classList.remove("active");
      menu.classList.remove("is-open");
    });
  });
}

// ==========================
// SUBMENU (mobile only)
// ==========================
function initSubmenu() {
  const submenuToggles = document.querySelectorAll(".submenu-toggle");
  if (!submenuToggles || submenuToggles.length === 0) return;

  submenuToggles.forEach(toggle => {
    toggle.addEventListener("click", e => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = toggle.closest(".has-submenu");
        if (parent) parent.classList.toggle("is-open");
      }
    });
  });
}

// ==========================
// STICKY HEADER ON SCROLL
// ==========================
function initStickyHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-sticky", window.scrollY > 0);
  };

  onScroll(); // initial state
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Ensure CSS variable for header height is set so mobile menu can sit below it
function setHeaderHeightVar() {
  const header = document.querySelector('header');
  if (!header) return;
  document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
}

// ==========================
// INIT ALL
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  initHamburgerMenu();
  initSubmenu();
  initStickyHeader();
  setHeaderHeightVar();
  window.addEventListener('resize', setHeaderHeightVar, { passive: true });
});

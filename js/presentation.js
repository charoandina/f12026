// ======================= presentations.js =======================
// NOTE: Code comments in English (as requested).

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
  const countdownNumberEl = document.querySelector(".presentation_img div p");
  const countdownLabelEl = document.querySelector(".presentation_img div span");

  // Presentation data (2026)
  const PRESENTATIONS = {
    "red bull": { iso: "2026-01-15", class: "redbull" },
    "racing bulls": { iso: "2026-01-15", class: "racingbulls" },
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

  // Render UI for selected team
  function render(teamName) {
    const data = PRESENTATIONS[norm(teamName)];
    if (!data) return;

    teamEl.textContent = teamName;
    dateEl.textContent = formatEsShort(data.iso);

    const d = daysUntil(data.iso);
    countdownNumberEl.textContent = d;
    countdownLabelEl.textContent = d === 1 ? "día" : "días";

    clearTeamBackgrounds();
    presentationInfo.classList.add(data.class);
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

  // Initial state (Ferrari)
  render("red bull");

  const initialTeam = [...teamsWrap.querySelectorAll(".team")]
    .find(t => norm(t.querySelector("p")?.textContent) === "red bull");

  if (initialTeam) initialTeam.classList.add("active");
}

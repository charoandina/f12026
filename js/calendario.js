// ======================= calendar-accordion.js =======================

document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.querySelector(".calendar_container");
  if (!calendar) return;

  // Close all items except (optionally) the one we want to keep open
  function closeAll(exceptRace = null) {
    const races = calendar.querySelectorAll(".race");
    races.forEach((race) => {
      if (exceptRace && race === exceptRace) return;

      const stats = race.querySelector(".racestats_container");
      const arrow = race.querySelector(".racestatus_container svg");

      if (stats) stats.classList.add("hidden");
      if (arrow) arrow.classList.remove("is-rotated");
      race.classList.remove("is-open");
    });
  }

  calendar.addEventListener("click", (e) => {
    const header = e.target.closest(".raceinfo_container");
    if (!header || !calendar.contains(header)) return;

    const race = header.closest(".race");
    if (!race) return;

    const stats = race.querySelector(".racestats_container");
    const arrow = race.querySelector(".racestatus_container svg");
    if (!stats) return;

    const isOpen = !stats.classList.contains("hidden");

    // Always close others first
    closeAll(race);

    // Toggle current
    if (isOpen) {
      stats.classList.add("hidden");
      if (arrow) arrow.classList.remove("is-rotated");
      race.classList.remove("is-open");
    } else {
      stats.classList.remove("hidden");
      if (arrow) arrow.classList.add("is-rotated");
      race.classList.add("is-open");
    }
  });
});

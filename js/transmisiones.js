// VAMOS NENE - ANIMATION

const headline = document.getElementById("headline");
const scenes = Array.from(headline.querySelectorAll(".scene"));

let idx = 0;
const DURATION_MS = 3000; // Time each scene stays visible

function showScene(nextIdx) {
  scenes[idx].classList.remove("is-active");
  idx = nextIdx;
  scenes[idx].classList.add("is-active");
}

// Auto-loop scenes
setInterval(() => {
  const next = (idx + 1) % scenes.length;
  showScene(next);
}, DURATION_MS);

// Optional: click to advance (nice for testing)
headline.addEventListener("click", () => {
  const next = (idx + 1) % scenes.length;
  showScene(next);
});

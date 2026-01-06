let mode = "solo"; // solo | duo
let phase = "guess"; // secret | guess
let secretNumber = 0;
let tries = 0;
let max = 100;

/* ELEMENTS */
const input = document.getElementById("numberInput");
const validateBtn = document.getElementById("validateBtn");
const message = document.getElementById("message");
const triesText = document.getElementById("triesText");
const phaseText = document.getElementById("phaseText");
const resetBtn = document.getElementById("resetBtn");
const modeBtn = document.getElementById("modeToggle");
const themeBtn = document.getElementById("themeToggle");
const levelSelect = document.getElementById("difficulty");
const bestScoreEl = document.getElementById("bestScore");
const levelBox = document.getElementById("levelBox");

/* ===== THEME ===== */
themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  themeBtn.textContent =
    document.body.classList.contains("light") ? "☀️" : "🌙";
};

/* ===== MODE ===== */
modeBtn.onclick = () => {
  mode = mode === "solo" ? "duo" : "solo";
  modeBtn.textContent = mode === "solo" ? "👤 1 Joueur" : "👥 2 Joueurs";
  resetGame();
};

/* ===== NIVEAU ===== */
levelSelect.onchange = () => {
  max = Number(levelSelect.value);
  resetGame();
};

/* ===== VALIDER ===== */
validateBtn.onclick = () => {
  const value = Number(input.value);
  if (!value) return;

  if (mode === "solo") soloGame(value);
  else duoGame(value);

  input.value = "";
};

/* ===== MODE 1 JOUEUR ===== */
function soloGame(value) {
  tries++;
  triesText.textContent = `Essais : ${tries}`;

  if (value < secretNumber) message.textContent = "🔽 Trop petit";
  else if (value > secretNumber) message.textContent = "🔼 Trop grand";
  else {
    message.textContent = `🎉 Bravo ! Trouvé en ${tries} essais`;
    saveBestScore();
    resetBtn.classList.remove("hidden");
  }
}

/* ===== MODE 2 JOUEURS ===== */
function duoGame(value) {
  if (phase === "secret") {
    secretNumber = value;
    phase = "guess";
    input.type = "number";
    phaseText.textContent = "Joueur 2 : devine le nombre";
    message.textContent = "🔒 Nombre enregistré";
  } else {
    tries++;
    triesText.textContent = `Essais : ${tries}`;

    if (value < secretNumber) message.textContent = "🔽 Trop petit";
    else if (value > secretNumber) message.textContent = "🔼 Trop grand";
    else {
      message.textContent = `🏆 Joueur 2 gagne en ${tries} essais`;
      resetBtn.classList.remove("hidden");
    }
  }
}

/* ===== SCORE ===== */
function saveBestScore() {
  const key = `best-${max}`;
  const best = localStorage.getItem(key);
  if (!best || tries < best) {
    localStorage.setItem(key, tries);
    bestScoreEl.textContent = tries;
  }
}

function loadBestScore() {
  const key = `best-${max}`;
  bestScoreEl.textContent = localStorage.getItem(key) || "—";
}

/* ===== RESET ===== */
resetBtn.onclick = resetGame;

function resetGame() {
  tries = 0;
  triesText.textContent = "Essais : 0";
  message.textContent = "";
  resetBtn.classList.add("hidden");

  if (mode === "solo") {
    levelBox.style.display = "block";
    input.type = "number";
    secretNumber = Math.floor(Math.random() * max) + 1;
    phaseText.textContent = `Devine le nombre (1–${max})`;
    loadBestScore();
  } else {
    levelBox.style.display = "none";
    phase = "secret";
    input.type = "password";
    phaseText.textContent = "Joueur 1 : entre le nombre secret";
    bestScoreEl.textContent = "—";
  }
}

/* INIT */
resetGame();

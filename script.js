let mode = "solo"; // solo | duo
let phase = "guess"; // secret | guess
let secretNumber = 0;
let tries = 0;
let max = 100;
let maxAttempts = 7;
let timer = 0;
let interval = null;
let bestScores = JSON.parse(localStorage.getItem("bestScores")) || {};
let playerName = "";

/* ===== ELEMENTS ===== */
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
const leaderboardEl = document.getElementById("topScores");
const playerInput = document.getElementById("playerName");

/* ===== THEME ===== */
themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️ Mode Clair" : "🌙 Mode Sombre";
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
  maxAttempts = max === 50 ? 10 : max === 100 ? 7 : 5;
  resetGame();
};

/* ===== VALIDER ===== */
validateBtn.onclick = () => {
  playerName = playerInput.value.trim() || "Joueur";
  const value = Number(input.value);
  if (!value) return;
  if (mode === "solo") soloGame(value);
  else duoGame(value);
  input.value = "";
};

/* ===== TIMER ===== */
function startTimer() {
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = timer + "s";
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

/* ===== MODE 1 JOUEUR ===== */
function soloGame(value) {
  if (!interval) startTimer();
  tries++;
  triesText.textContent = `Essais : ${tries}/${maxAttempts}`;

  if (value < secretNumber) message.textContent = "🔽 Trop petit";
  else if (value > secretNumber) message.textContent = "🔼 Trop grand";
  else {
    message.textContent = `🎉 Bravo ${playerName}! Trouvé en ${tries} essais`;
    stopTimer();
    saveScore();
    resetBtn.classList.remove("hidden");
    return;
  }

  if (tries >= maxAttempts) {
    stopTimer();
    message.textContent = `❌ Perdu ! Le nombre était ${secretNumber}`;
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
function saveScore() {
  const score = (maxAttempts - tries + 1) * 100 - timer * 2;
  const key = `topScores-${max}`;
  let scores = JSON.parse(localStorage.getItem(key)) || [];
  scores.push({name: playerName, score});
  scores.sort((a,b)=>b.score - a.score);
  if (scores.length>5) scores = scores.slice(0,5);
  localStorage.setItem(key, JSON.stringify(scores));
  loadLeaderboard();
  bestScoreEl.textContent = scores[0].score;
}

function loadLeaderboard() {
  const key = `topScores-${max}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];
  leaderboardEl.innerHTML = "";
  scores.forEach(s=> {
    const li = document.createElement("li");
    li.textContent = `${s.name} : ${s.score}`;
    leaderboardEl.appendChild(li);
  });
}

/* ===== RESET ===== */
resetBtn.onclick = resetGame;

function resetGame() {
  tries = 0;
  timer = 0;
  stopTimer();
  triesText.textContent = `Essais : 0`;
  message.textContent = "";
  resetBtn.classList.add("hidden");

  if (mode === "solo") {
    levelBox.style.display = "block";
    input.type = "number";
    secretNumber = Math.floor(Math.random() * max) + 1;
    phaseText.textContent = `Devine le nombre (1–${max})`;
    maxAttempts = max === 50 ? 10 : max === 100 ? 7 : 5;
    loadLeaderboard();
    bestScoreEl.textContent = JSON.parse(localStorage.getItem(`topScores-${max}`))?.[0]?.score || "—";
  } else {
    levelBox.style.display = "none";
    phase = "secret";
    input.type = "password";
    phaseText.textContent = "Joueur 1 : entre le nombre secret";
    bestScoreEl.textContent = "—";
    leaderboardEl.innerHTML = "";
  }
}

/* ===== INIT ===== */
resetGame();


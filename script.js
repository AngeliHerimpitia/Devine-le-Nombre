// --- Variables ---
let mode = "solo", phase = "guess", secretNumber = 0, tries = 0, max = 100, maxAttempts = 7;
let timer = 0, interval = null;
let history2P = JSON.parse(localStorage.getItem("history2P")) || [];
let playerName = "";

// --- Elements ---
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
const historyList = document.getElementById("historyList");

// --- Canvas Confetti ---
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");
let confettiParticles = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function spawnConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 10 + 5,
      color: `hsl(${Math.random() * 360},70%,60%)`,
      tilt: Math.random() * 10 - 10
    });
  }
}

function renderConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles.forEach((p, i) => {
    ctx.beginPath();
    ctx.moveTo(p.x + p.tilt, p.y);
    ctx.lineTo(p.x + p.tilt + 5, p.y + p.r);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(p.d);
    if (p.y > canvas.height) confettiParticles.splice(i, 1);
  });
  requestAnimationFrame(renderConfetti);
}

// --- Timer ---
function startTimer() {
  if (interval) clearInterval(interval);
  timer = 0;
  document.getElementById("timer").textContent = timer + "s";
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = timer + "s";
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

// --- Theme Toggle ---
themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "Mode Sombre" : "Mode Clair";
};

// --- Mode Toggle ---
modeBtn.onclick = () => {
  mode = mode === "solo" ? "duo" : "solo";
  modeBtn.textContent = mode === "solo" ? "Mode 1 Joueur" : "Mode 2 Joueurs";
  resetGame();
};

// --- Level Select ---
levelSelect.onchange = () => {
  max = Number(levelSelect.value);
  maxAttempts = max === 50 ? 10 : max === 100 ? 7 : 5;
  resetGame();
};

// --- Validate Button ---
validateBtn.onclick = () => {
  playerName = playerInput.value.trim() || "Joueur";
  const value = Number(input.value);
  if (!value) return;
  if (mode === "solo") soloGame(value);
  else duoGame(value);
  input.value = "";
};

// --- Solo Game ---
function soloGame(value) {
  if (!interval) startTimer();
  tries++;
  triesText.textContent = `Essais : ${tries}/${maxAttempts}`;

  if (value < secretNumber) showMsg("Trop petit", "wrong");
  else if (value > secretNumber) showMsg("Trop grand", "wrong");
  else { victory(); return; }

  if (tries >= maxAttempts) lose();
}

function victory() {
  showMsg(`Bravo ${playerName}!`, "correct");
  stopTimer();
  spawnConfetti(); renderConfetti();
  saveScore();
  resetBtn.classList.remove("hidden");
}

function lose() {
  stopTimer();
  showMsg(`Perdu ! Le nombre était ${secretNumber}`, "wrong");
  resetBtn.classList.remove("hidden");
}

// --- Duo Game ---
function duoGame(value) {
  if (phase === "secret") {
    secretNumber = value;
    phase = "guess";
    input.type = "number";
    phaseText.textContent = "Joueur 2 : devine le nombre";
    message.textContent = "Nombre enregistré";
  } else {
    tries++;
    triesText.textContent = `Essais : ${tries}`;
    if (value < secretNumber) showMsg("Trop petit", "wrong");
    else if (value > secretNumber) showMsg("Trop grand", "wrong");
    else {
      showMsg(`Joueur 2 gagne en ${tries} essais`, "correct");
      spawnConfetti(); renderConfetti();
      addHistory2P(playerName, tries, secretNumber);
      resetBtn.classList.remove("hidden");
    }
  }
}

// --- Show Message ---
function showMsg(msg, type) {
  message.textContent = msg;
  message.className = type;
}

// --- Score Solo ---
function saveScore() {
  const score = (maxAttempts - tries + 1) * 100 - timer * 2;
  const key = `topScores-${max}`;
  let scores = JSON.parse(localStorage.getItem(key)) || [];
  scores.push({ name: playerName, score });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 5) scores = scores.slice(0, 5);
  localStorage.setItem(key, JSON.stringify(scores));
  loadLeaderboard();
  bestScoreEl.textContent = scores[0]?.score || "—";
}

function loadLeaderboard() {
  const key = `topScores-${max}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];
  leaderboardEl.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} : ${s.score}`;
    leaderboardEl.appendChild(li);
  });
}

// --- History 2P ---
function addHistory2P(name, tries, secret) {
  history2P.unshift({ name, tries, secret });
  if (history2P.length > 10) history2P.pop();
  localStorage.setItem("history2P", JSON.stringify(history2P));
  renderHistory2P();
}

function renderHistory2P() {
  historyList.innerHTML = "";
  history2P.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.name} a trouvé ${h.secret} en ${h.tries} essais`;
    historyList.appendChild(li);
  });
}

// --- Reset Game ---
resetBtn.onclick = resetGame;

function resetGame() {
  tries = 0; timer = 0; stopTimer();
  triesText.textContent = "Essais : 0";
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

  renderHistory2P();
}

// --- INIT ---
resetGame();
// --- Permettre l'envoi avec la touche Entrée ---
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    validateBtn.click();
  }
});

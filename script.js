let mode = "solo"; // solo | duo
let phase = "guess"; // secret | guess
let secretNumber = 0;
let tries = 0;
let max = 100;
let maxAttempts = 7;
let timer = 0;
let interval = null;
let bestScores = JSON.parse(localStorage.getItem("bestScores")) || {};
let history2P = JSON.parse(localStorage.getItem("history2P")) || [];
let playerName = "";
let soundOn = true;

/* ===== ELEMENTS ===== */
const input = document.getElementById("numberInput");
const validateBtn = document.getElementById("validateBtn");
const message = document.getElementById("message");
const triesText = document.getElementById("triesText");
const phaseText = document.getElementById("phaseText");
const resetBtn = document.getElementById("resetBtn");
const modeBtn = document.getElementById("modeToggle");
const themeBtn = document.getElementById("themeToggle");
const soundBtn = document.getElementById("soundToggle");
const levelSelect = document.getElementById("difficulty");
const bestScoreEl = document.getElementById("bestScore");
const levelBox = document.getElementById("levelBox");
const leaderboardEl = document.getElementById("topScores");
const playerInput = document.getElementById("playerName");
const historyList = document.getElementById("historyList");

/* ===== SONS ===== */
const audioClick = new Audio("https://freesound.org/data/previews/522/522220_915571-lq.mp3");
const audioWin = new Audio("https://freesound.org/data/previews/320/320181_5260876-lq.mp3");
const audioLose = new Audio("https://freesound.org/data/previews/411/411635_512123-lq.mp3");

/* ===== THEME ===== */
themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️ Mode Clair" : "🌙 Mode Sombre";
};

/* ===== SOUND ===== */
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Sons ON" : "🔇 Sons OFF";
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
  if(soundOn) audioClick.play();
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

  if (value < secretNumber) showMsg("🔽 Trop petit","wrong");
  else if (value > secretNumber) showMsg("🔼 Trop grand","wrong");
  else {
    showMsg(`🎉 Bravo ${playerName}! Trouvé en ${tries} essais`,"correct");
    stopTimer();
    if(soundOn) audioWin.play();
    saveScore();
    resetBtn.classList.remove("hidden");
    return;
  }

  if (tries >= maxAttempts && value !== secretNumber) {
    stopTimer();
    showMsg(`❌ Perdu ! Le nombre était ${secretNumber}`,"wrong");
    if(soundOn) audioLose.play();
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
    if (value < secretNumber) showMsg("🔽 Trop petit","wrong");
    else if (value > secretNumber) showMsg("🔼 Trop grand","wrong");
    else {
      showMsg(`🏆 Joueur 2 gagne en ${tries} essais`,"correct");
      if(soundOn) audioWin.play();
      addHistory2P(playerName, tries, secretNumber);
      resetBtn.classList.remove("hidden");
    }
  }
}

/* ===== MESSAGE ===== */
function showMsg(msg,type){
  message.textContent = msg;
  message.className = type;
}

/* ===== SCORE SOLO ===== */
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

/* ===== HISTORIQUE 2 JOUEURS ===== */
function addHistory2P(name, tries, secret){
  history2P.unshift({name, tries, secret});
  if(history2P.length>10) history2P.pop();
  localStorage.setItem("history2P",JSON.stringify(history2P));
  renderHistory2P();
}

function renderHistory2P(){
  historyList.innerHTML = "";
  history2P.forEach(h=>{
    const li = document.createElement("li");
    li.textContent = `${h.name} a trouvé ${h.secret} en ${h.tries} essais`;
    historyList.appendChild(li);
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

  if(mode === "solo"){
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

/* ===== INIT ===== */
resetGame();

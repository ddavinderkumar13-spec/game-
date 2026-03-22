const COLORS = ["red", "blue", "green", "orange", "purple", "yellow"];
const UNITS_PER_COLOR = 4;
let NUM_BOTTLES = 6;
let LEVEL = 1;

let bottles = [];
let selectedBottle = null;
let moveHistory = [];
let timerInterval;
let seconds = 0;

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  document.getElementById("timer").innerText = "⏰ Time: 0s";
  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer").innerText = `⏰ Time: ${seconds}s`;
  }, 1000);
}

function createGame(level = 1) {
  LEVEL = level;
  let colorCount = 2 + Math.min(level, COLORS.length - 2);
  let bottleCount = colorCount + 2;

  NUM_BOTTLES = bottleCount;
  const selectedColors = COLORS.slice(0, colorCount);
  let units = selectedColors.flatMap(c => [c, c, c, c]);

  // Shuffle units
  for (let i = units.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [units[i], units[j]] = [units[j], units[i]];
  }

  bottles = Array(bottleCount).fill().map(() => []);
  moveHistory = [];

  let index = 0;
  for (let i = 0; i < bottleCount - 2; i++) {
    bottles[i] = units.slice(index, index + 4);
    index += 4;
  }

  selectedBottle = null;
  document.getElementById("level").innerText = `Level: ${LEVEL}`;
  renderGame();
  startTimer();
}

function renderGame() {
  const gameDiv = document.getElementById("game");
  gameDiv.innerHTML = "";

  bottles.forEach((bottle, i) => {
    const bottleDiv = document.createElement("div");
    bottleDiv.className = "bottle";
    bottleDiv.onclick = () => handleBottleClick(i);
    if (selectedBottle === i) bottleDiv.classList.add("selected");

    bottle.forEach(color => {
      const unitDiv = document.createElement("div");
      unitDiv.className = "unit";
      unitDiv.style.backgroundColor = color;
      bottleDiv.appendChild(unitDiv);
    });

    gameDiv.appendChild(bottleDiv);
  });
}
function handleBottleClick(index) {
  playSound("clickSound"); // 

  if (selectedBottle === null) {
    if (bottles[index].length === 0) return;
    selectedBottle = index;
  } else {
    if (selectedBottle !== index) {
      moveHistory.push(JSON.stringify(bottles.map(b => [...b])));
      pourWater(selectedBottle, index);
    }
    selectedBottle = null;
  }
  renderGame();
  checkWin();
}

function pourWater(from, to) {
  const source = bottles[from];
  const target = bottles[to];
  if (target.length === 4) return;

  const colorToPour = source[source.length - 1];
  let count = 0;
  for (let i = source.length - 1; i >= 0; i--) {
    if (source[i] === colorToPour) {
      count++;
    } else {
      break;
    }
  }

  if (target.length === 0 || target[target.length - 1] === colorToPour) {
    let spaceLeft = 4 - target.length;
    let pourCount = Math.min(spaceLeft, count);

    for (let i = 0; i < pourCount; i++) {
      target.push(source.pop());
    }
  }
}

function checkWin() {
  const complete = bottles.every(
    b => b.length === 0 || (b.length === 4 && new Set(b).size === 1)
  );
  if (complete) {
    clearInterval(timerInterval);
    playLevelCompleteSound();

    createConfetti();

    // Save next level in memory
    localStorage.setItem("currentLevel", LEVEL + 1);

    const msg = document.getElementById("levelUpMessage");
    msg.style.display = "block";

    setTimeout(() => {
      msg.style.display = "none";
      if (LEVEL < 12) createGame(LEVEL + 1);
    }, 4000);
  }
}

function restartGame() {
  createGame(LEVEL);
}

function undoMove() {
  if (moveHistory.length > 0) {
    bottles = JSON.parse(moveHistory.pop());
    renderGame();
  }
}

// Start first level
createGame();

const bgThemes = [
  "linear-gradient(to bottom right, #e0f7fa, #80deea)",
  "linear-gradient(to bottom, #fbeec1, #f8b195)",
  "linear-gradient(to right, #dcedc8, #aed581)",
  "linear-gradient(to right, #ffe0b2, #ffcc80)",
  "#ffffff"
];
let currentBg = 0;

function cycleBackground() {
  currentBg = (currentBg + 1) % bgThemes.length;
  document.body.style.background = bgThemes[currentBg];
}
function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}
let musicPlaying = false;

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicButton");

  if (musicPlaying) {
    music.pause();
    btn.textContent = "🔇OFF";
  } else {
    music.play();
    btn.textContent = "🔊ON";
  }
  musicPlaying = !musicPlaying;
}
function updateBottle(index) {
  const bottleDiv = document.querySelectorAll(".bottle")[index];
  const bottle = bottles[index];
  bottleDiv.innerHTML = "";
  bottle.forEach(color => {
    const unitDiv = document.createElement("div");
    unitDiv.className = "unit";
    unitDiv.style.backgroundColor = color;
    bottleDiv.appendChild(unitDiv);
  });
}
function playLevelCompleteSound() {
  const sound = document.getElementById("levelCompleteSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}
function createConfetti() {
  const numConfetti = 100;
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "absolute";
  confettiContainer.style.top = "0";
  confettiContainer.style.left = "0";
  confettiContainer.style.width = "100vw";
  confettiContainer.style.height = "100vh";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = "9999";
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < numConfetti; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    const startPosX = Math.random() * window.innerWidth;
    const startPosY = Math.random() * window.innerHeight;
    confetti.style.left = `${startPosX}px`;
    confetti.style.top = `${startPosY}px`;
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 4000);
}
function startGame() {
  document.getElementById("mainMenu").style.display = "none";
  createGame(); 
}

function showHowToPlay() {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("howToPlay").style.display = "flex";
}

function backToMenu() {
  document.getElementById("howToPlay").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}
 
function createGame(level = null) {
  // Load saved level if not given
  if (level === null) {
    const savedLevel = localStorage.getItem("currentLevel");
    level = savedLevel ? parseInt(savedLevel) : 1;
  }

  LEVEL = level;
  let colorCount = 2 + Math.min(level, COLORS.length - 2);
  let bottleCount = colorCount + 2;

  NUM_BOTTLES = bottleCount;
  const selectedColors = COLORS.slice(0, colorCount);
  let units = selectedColors.flatMap(c => [c, c, c, c]);

  // Shuffle units
  for (let i = units.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [units[i], units[j]] = [units[j], units[i]];
  }

  bottles = Array(bottleCount).fill().map(() => []);
  moveHistory = [];

  let index = 0;
  for (let i = 0; i < bottleCount - 2; i++) {
    bottles[i] = units.slice(index, index + 4);
    index += 4;
  }

  selectedBottle = null;
  document.getElementById("level").innerText = `Level: ${LEVEL}`;
  renderGame();
  startTimer();
}

function resetProgress() {
  localStorage.removeItem("currentLevel");
  createGame(1); 
}

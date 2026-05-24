import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCIky3PO6xrO9SU33m7h76z5Y4VIjKlYok",
  authDomain: "imposter-3d642.firebaseapp.com",
  databaseURL: "https://imposter-3d642-default-rtdb.firebaseio.com",
  projectId: "imposter-3d642",
  storageBucket: "imposter-3d642.firebasestorage.app",
  messagingSenderId: "1032266053376",
  appId: "1:1032266053376:web:054bcc4e32535f5d4165e5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// WORDS
const words = [
  "Pizza", "Hospital", "Banana", "Toothbrush", "Pillow", "Umbrella", "Keyboard", "Mouse", "Laptop", "Phone",
  "Headphones", "Backpack", "Water bottle", "Mug", "Spoon", "Fork", "Knife", "Plate", "Bowl", "Pan",
  "Fridge", "Microwave", "Fan", "Air conditioner", "Television", "Remote", "Couch", "Bed", "Blanket", "Socks",
  "Shoe", "Slippers", "Jacket", "Hat", "Sunglasses", "Watch", "Ring", "Necklace", "Comb", "Mirror",
  "Shampoo bottle", "Soap", "Towel", "Toothpaste", "Perfume", "Lipstick", "Charger", "Extension cord", "Battery", "Flashlight",
  "Camera", "Tripod", "Speaker", "Guitar", "Piano", "Drum", "Violin", "Book", "Notebook", "Pen",
  "Pencil", "Eraser", "Sharpener", "Ruler", "Scissors", "Glue", "Tape", "Stapler", "Calculator", "Clock",
  "Calendar", "Globe", "Map", "Wallet", "Coin", "Key", "Lock", "Doorbell", "Candle", "Matchbox",
  "Plant pot", "Flower vase", "Teddy bear", "Dice", "Chess board", "Playing cards", "Basketball", "Football", "Cricket bat", "Helmet",
  "Bicycle", "Skateboard", "Traffic cone", "Shopping cart", "Elevator", "Escalator", "Telescope", "Binoculars", "Thermometer", "Syringe",
  "Magnet"
];

// ELEMENTS
const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("roomCode");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const errorText = document.getElementById("errorText");
const homeScreen = document.getElementById("homeScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const voteScreen = document.getElementById("voteScreen");
const resultScreen = document.getElementById("resultScreen");
const displayCode = document.getElementById("displayCode");
const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");
const copyBtn = document.getElementById("copyBtn");
const readyBtn = document.getElementById("readyBtn");
const startBtn = document.getElementById("startBtn");
const leaveBtn = document.getElementById("leaveBtn");
const roleText = document.getElementById("roleText");
const wordText = document.getElementById("wordText");
const voteBtn = document.getElementById("voteBtn");
const voteList = document.getElementById("voteList");
const voteStatus = document.getElementById("voteStatus");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");
const particleField = document.getElementById("particleField");

// STATE
let currentRoom = "";
let currentPlayerId = "";
let currentUsername = "";
let isReady = false;
let unsubscribeLobby = null;
let hideErrorTimer = null;

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function showError(message) {
  errorText.textContent = message;
  clearTimeout(hideErrorTimer);
  hideErrorTimer = setTimeout(() => {
    errorText.textContent = "";
  }, 2600);
}

function setLoading(button, loadingText, isLoading) {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent.trim();
    }
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }

  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
  }
  button.disabled = false;
}

function normalizeUsername(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 14);
}

function clearLobbySubscription() {
  if (typeof unsubscribeLobby === "function") {
    unsubscribeLobby();
  }
  unsubscribeLobby = null;
}

function showScreen(screen) {
  [homeScreen, lobbyScreen, gameScreen, voteScreen, resultScreen].forEach((el) => {
    if (!el) return;
    el.classList.add("hidden");
  });

  if (screen) {
    screen.classList.remove("hidden");
  }
}

function makeAvatarLetter(name = "?") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function canUseReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createParticles() {
  if (!particleField || canUseReducedMotion()) return;

  const count = 20;
  particleField.innerHTML = "";

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    const size = 3 + Math.random() * 4;
    const left = Math.random() * 100;
    const delay = Math.random() * -18;
    const duration = 10 + Math.random() * 14;
    const opacity = 0.3 + Math.random() * 0.7;

    particle.style.left = `${left}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.opacity = `${opacity}`;

    particleField.appendChild(particle);
  }
}

function bindHoverTilt() {
  if (canUseReducedMotion()) return;

  const cards = document.querySelectorAll(".glass-card, .hero-copy, .feature-card, .player-card, .vote-card, .note-card, .stat-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
      card.style.transform = `translate3d(0,0,0) perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-1px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function setupAmbientMotion() {
  const root = document.documentElement;
  window.addEventListener("mousemove", (event) => {
    const px = (event.clientX / window.innerWidth) * 100;
    const py = (event.clientY / window.innerHeight) * 100;
    root.style.setProperty("--pointer-x", `${px}%`);
    root.style.setProperty("--pointer-y", `${py}%`);
  }, { passive: true });
}

function addButtonRipple(button) {
  if (!button) return;
  button.addEventListener("click", (event) => {
    if (canUseReducedMotion()) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
    ripple.style.transform = "translate(-50%, -50%) scale(0)";
    ripple.style.borderRadius = "999px";
    ripple.style.pointerEvents = "none";
    ripple.style.background = "rgba(255,255,255,0.18)";
    ripple.style.transition = "transform 420ms ease, opacity 420ms ease";

    if (getComputedStyle(button).position === "static") {
      button.style.position = "relative";
      button.style.overflow = "hidden";
    }

    button.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "translate(-50%, -50%) scale(1)";
      ripple.style.opacity = "0";
    });
    setTimeout(() => ripple.remove(), 500);
  });
}

function paintPlayerList(players = {}, hostId = "") {
  playerList.innerHTML = "";

  const entries = Object.entries(players);

  if (!entries.length) {
    playerList.innerHTML = `
      <div class="note-card">
        <strong>No one here yet</strong>
        <span>Send the room code around and get the chaos started.</span>
      </div>
    `;
    return;
  }

  entries.forEach(([id, player]) => {
    const card = document.createElement("div");
    card.className = "player-card";

    const isHost = (hostId && id === hostId) || player.isHost === true;
    const isMe = id === currentPlayerId;
    const ready = Boolean(player.ready);

    card.innerHTML = `
      <div class="avatar">${makeAvatarLetter(player.username)}</div>
      <div class="player-meta">
        <div class="player-name">${isMe ? `${player.username} · You` : player.username}</div>
        <div class="player-subtitle">${ready ? "Locked in and ready" : "Still warming up"}</div>
      </div>
      <div class="badges">
        ${isHost ? '<span class="badge host">Host</span>' : ""}
        ${ready ? '<span class="badge ready">Ready</span>' : ""}
      </div>
    `;

    playerList.appendChild(card);
  });
}

function renderLobby(data) {
  const players = data.players || {};
  const me = players[currentPlayerId];

  playerCount.textContent = `${Object.keys(players).length}/8 Players`;

  paintPlayerList(players, data.hostId || "");

  const hostActive = Boolean(
    (data.hostId && data.hostId === currentPlayerId) ||
    (data.host && data.host === currentUsername)
  );

  startBtn.classList.toggle("hidden", !hostActive);

  if (me) {
    isReady = Boolean(me.ready);
    readyBtn.textContent = isReady ? "Unready" : "Ready";
  } else {
    readyBtn.textContent = "Ready";
  }

  if (data.phase === "game") {
    showGame(data);
    return;
  }

  if (data.phase === "voting") {
    showVoting(data);
    return;
  }

  if (data.phase === "result") {
    showResult(data);
    return;
  }

  showScreen(lobbyScreen);
}

async function openLobby(roomCode) {
  currentRoom = roomCode;

  clearLobbySubscription();
  showScreen(lobbyScreen);
  displayCode.textContent = roomCode;

  const lobbyRef = ref(db, `lobbies/${roomCode}`);

  unsubscribeLobby = onValue(lobbyRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    renderLobby(data);
  });
}

createBtn.addEventListener("click", async () => {
  const username = normalizeUsername(usernameInput.value);
  if (!username) {
    showError("Enter username");
    return;
  }

  setLoading(createBtn, "Creating...", true);
  setLoading(joinBtn, "Join Lobby", false);

  try {
    currentUsername = username;

    const roomCode = generateRoomCode();
    const lobbyRef = ref(db, `lobbies/${roomCode}`);
    const playerRef = push(ref(db, `lobbies/${roomCode}/players`));
    currentPlayerId = playerRef.key;

    await set(lobbyRef, {
      host: username,
      hostId: currentPlayerId,
      started: false,
      phase: "lobby",
      createdAt: Date.now()
    });

    await set(playerRef, {
      username,
      ready: false,
      voted: false,
      isHost: true
    });

    isReady = false;
    await openLobby(roomCode);
  } catch (error) {
    console.error(error);
    showError("Could not create lobby");
  } finally {
    setLoading(createBtn, "Create Lobby", false);
  }
});

joinBtn.addEventListener("click", async () => {
  const username = normalizeUsername(usernameInput.value);
  const roomCode = roomCodeInput.value.trim().toUpperCase();

  if (!username) {
    showError("Enter username");
    return;
  }

  if (!roomCode) {
    showError("Enter room code");
    return;
  }

  setLoading(joinBtn, "Joining...", true);
  setLoading(createBtn, "Create Lobby", false);

  try {
    currentUsername = username;

    const lobbyRef = ref(db, `lobbies/${roomCode}`);
    const snapshot = await get(lobbyRef);

    if (!snapshot.exists()) {
      showError("Lobby not found");
      return;
    }

    const data = snapshot.val();
    const players = data.players || {};

    if (Object.keys(players).length >= 8) {
      showError("Lobby full");
      return;
    }

    if (data.phase && data.phase !== "lobby") {
      showError("Round already started");
      return;
    }

    const playerRef = push(ref(db, `lobbies/${roomCode}/players`));
    currentPlayerId = playerRef.key;

    await set(playerRef, {
      username,
      ready: false,
      voted: false
    });

    isReady = false;
    await openLobby(roomCode);
  } catch (error) {
    console.error(error);
    showError("Could not join lobby");
  } finally {
    setLoading(joinBtn, "Join Lobby", false);
  }
});

function readyPulseText() {
  return isReady ? "Unready" : "Ready";
}

readyBtn.addEventListener("click", async () => {
  if (!currentRoom || !currentPlayerId) return;

  try {
    isReady = !isReady;

    await update(ref(db, `lobbies/${currentRoom}/players/${currentPlayerId}`), {
      ready: isReady
    });

    readyBtn.textContent = readyPulseText();
  } catch (error) {
    console.error(error);
    showError("Could not update ready state");
    isReady = !isReady;
  }
});

startBtn.addEventListener("click", async () => {
  try {
    const snapshot = await get(ref(db, `lobbies/${currentRoom}`));
    const data = snapshot.val();
    if (!data) return;

    const players = data.players || {};
    const ids = Object.keys(players);

    if (ids.length < 2) {
      showError("Need at least 2 players");
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const imposterId = ids[Math.floor(Math.random() * ids.length)];

    for (const id of ids) {
      const isImposter = id === imposterId;
      await update(ref(db, `lobbies/${currentRoom}/players/${id}`), {
        role: isImposter ? "imposter" : "crewmate",
        word: isImposter ? null : randomWord,
        voted: false
      });
    }

    await update(ref(db, `lobbies/${currentRoom}`), {
      phase: "game",
      started: true,
      votes: {}
    });
  } catch (error) {
    console.error(error);
    showError("Could not start match");
  }
});

function showGame(data) {
  showScreen(gameScreen);

  const players = data.players || {};
  const me = players[currentPlayerId];

  if (!me) return;

  if (me.role === "imposter") {
    roleText.textContent = "IMPOSTER";
    wordText.innerHTML = "Blend in, lie clean, and survive the vote.";
  } else {
    roleText.textContent = "CREWMATE";
    wordText.innerHTML = `Word: <strong>${me.word ?? "Unknown"}</strong>`;
  }
}

voteBtn.addEventListener("click", async () => {
  try {
    await update(ref(db, `lobbies/${currentRoom}`), {
      phase: "voting"
    });
  } catch (error) {
    console.error(error);
    showError("Could not open voting");
  }
});

function paintVoteList(players = {}, votes = {}) {
  voteList.innerHTML = "";

  Object.entries(players).forEach(([id, player]) => {
    const card = document.createElement("div");
    card.className = "vote-card";

    const voteCount = votes?.[id]?.count || 0;

    card.innerHTML = `
      <div class="avatar">${makeAvatarLetter(player.username)}</div>
      <div class="player-meta">
        <div class="player-name">${player.username}</div>
        <div class="player-subtitle">${voteCount} vote${voteCount === 1 ? "" : "s"}</div>
      </div>
      <button class="vote-btn">Vote</button>
    `;

    const btn = card.querySelector("button");

    if (players[currentPlayerId]?.voted) {
      btn.disabled = true;
      btn.textContent = "Voted";
    }

    btn.addEventListener("click", async () => {
      if (players[currentPlayerId]?.voted) return;

      try {
        await update(ref(db, `lobbies/${currentRoom}/votes/${id}`), {
          count: (votes?.[id]?.count || 0) + 1,
          username: player.username
        });

        await update(ref(db, `lobbies/${currentRoom}/players/${currentPlayerId}`), {
          voted: true
        });

        voteStatus.textContent = "Vote submitted";
        btn.disabled = true;
        btn.textContent = "Voted";

        checkVotes();
      } catch (error) {
        console.error(error);
        showError("Could not submit vote");
      }
    });

    voteList.appendChild(card);
  });
}

function showVoting(data) {
  showScreen(voteScreen);

  const players = data.players || {};
  const votes = data.votes || {};
  paintVoteList(players, votes);

  const me = players[currentPlayerId];
  if (me?.voted) {
    voteStatus.textContent = "Vote already submitted";
  } else {
    voteStatus.textContent = "Waiting for votes...";
  }
}

async function checkVotes() {
  const snapshot = await get(ref(db, `lobbies/${currentRoom}`));
  const data = snapshot.val();
  if (!data) return;

  const players = data.players || {};
  const votes = data.votes || {};

  const totalPlayers = Object.keys(players).length;
  const votedPlayers = Object.values(players).filter((player) => player.voted).length;

  if (votedPlayers < totalPlayers) return;

  let highest = 0;
  let eliminated = null;

  Object.entries(votes).forEach(([id, vote]) => {
    if ((vote?.count || 0) > highest) {
      highest = vote.count || 0;
      eliminated = id;
    }
  });

  const eliminatedPlayer = eliminated ? players[eliminated] : null;
  const imposter = Object.values(players).find((player) => player.role === "imposter");

  const imposterWon = eliminatedPlayer?.role !== "imposter";

  await update(ref(db, `lobbies/${currentRoom}`), {
    phase: "result",
    winner: imposterWon ? "Imposter" : "Crewmates",
    imposter: imposter?.username || "Unknown"
  });
}

function showResult(data) {
  showScreen(resultScreen);
  resultTitle.textContent = `${data.winner} Win`;
  resultText.innerHTML = `
    The imposter was<br><strong>${data.imposter || "Unknown"}</strong>
  `;
}

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentRoom);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy code";
    }, 1400);
  } catch (error) {
    console.error(error);
    showError("Could not copy code");
  }
});

leaveBtn.addEventListener("click", async () => {
  try {
    await remove(ref(db, `lobbies/${currentRoom}/players/${currentPlayerId}`));
  } catch (error) {
    console.error(error);
  } finally {
    clearLobbySubscription();
    location.reload();
  }
});

restartBtn.addEventListener("click", () => {
  clearLobbySubscription();
  location.reload();
});

function wireKeyboardSubmit() {
  usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      createBtn.click();
    }
  });

  roomCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      joinBtn.click();
    }
  });
}

function initBackground() {
  createParticles();
  setupAmbientMotion();
  bindHoverTilt();
}

[createBtn, joinBtn, readyBtn, startBtn, voteBtn, copyBtn, leaveBtn, restartBtn].forEach(addButtonRipple);
wireKeyboardSubmit();
initBackground();

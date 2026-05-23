import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue,
  update,
  remove
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

  apiKey: "AIzaSyCIky3PO6xrO9SU33m7h76z5Y4VIjKlYok",

  authDomain: "imposter-3d642.firebaseapp.com",

  databaseURL:
    "https://imposter-3d642-default-rtdb.firebaseio.com",

  projectId: "imposter-3d642",

  storageBucket:
    "imposter-3d642.firebasestorage.app",

  messagingSenderId: "1032266053376",

  appId:
    "1:1032266053376:web:054bcc4e32535f5d4165e5"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const usernameInput =
  document.getElementById("username");

const roomCodeInput =
  document.getElementById("roomCode");

const createBtn =
  document.getElementById("createBtn");

const joinBtn =
  document.getElementById("joinBtn");

const errorText =
  document.getElementById("errorText");

const homeScreen =
  document.getElementById("homeScreen");

const lobbyScreen =
  document.getElementById("lobbyScreen");

const displayCode =
  document.getElementById("displayCode");

const playerList =
  document.getElementById("playerList");

const playerCount =
  document.getElementById("playerCount");

const copyBtn =
  document.getElementById("copyBtn");

const readyBtn =
  document.getElementById("readyBtn");

const startBtn =
  document.getElementById("startBtn");

const leaveBtn =
  document.getElementById("leaveBtn");

let currentRoom = "";
let currentPlayerId = "";
let isReady = false;

function generateRoomCode(length = 6) {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {

    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  return result;

}

function showError(message) {

  errorText.textContent = message;

  setTimeout(() => {
    errorText.textContent = "";
  }, 3000);

}

createBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value.trim();

    if (!username) {
      showError("Enter username");
      return;
    }

    const roomCode =
      generateRoomCode();

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    await set(lobbyRef, {
      host: username,
      started: false,
      createdAt: Date.now()
    });

    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    const player =
      await push(playersRef, {
        username,
        ready: false
      });

    currentPlayerId = player.key;

    openLobby(roomCode);

  }
);

joinBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value.trim();

    const roomCode =
      roomCodeInput.value
        .trim()
        .toUpperCase();

    if (!username) {
      showError("Enter username");
      return;
    }

    if (!roomCode) {
      showError("Enter room code");
      return;
    }

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    const snapshot =
      await get(lobbyRef);

    if (!snapshot.exists()) {
      showError("Lobby not found");
      return;
    }

    const players =
      snapshot.val().players || {};

    if (
      Object.keys(players).length >= 8
    ) {
      showError("Lobby is full");
      return;
    }

    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    const player =
      await push(playersRef, {
        username,
        ready: false
      });

    currentPlayerId = player.key;

    openLobby(roomCode);

  }
);

function openLobby(roomCode) {

  currentRoom = roomCode;

  homeScreen.classList.add("hidden");

  lobbyScreen.classList.remove("hidden");

  displayCode.textContent = roomCode;

  const lobbyRef =
    ref(db, `lobbies/${roomCode}`);

  onValue(lobbyRef, (snapshot) => {

    const data = snapshot.val();

    if (!data) return;

    playerList.innerHTML = "";

    const players =
      data.players || {};

    const totalPlayers =
      Object.keys(players).length;

    playerCount.textContent =
      `${totalPlayers}/8 Players`;

    Object.entries(players).forEach(
      ([id, player]) => {

        const card =
          document.createElement("div");

        card.className =
          "player-card";

        const isHost =
          player.username === data.host;

        card.innerHTML = `

          <div class="avatar">
            ${player.username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div class="player-meta">

            <div class="player-name">
              ${player.username}
            </div>

            <div class="player-state">
              ${
                player.ready
                  ? "Ready to play"
                  : "Not ready"
              }
            </div>

          </div>

          <div class="badges">

            ${
              isHost
                ? `
                <div class="badge host">
                  HOST
                </div>
              `
                : ""
            }

            ${
              player.ready
                ? `
                <div class="badge ready">
                  READY
                </div>
              `
                : ""
            }

          </div>

        `;

        playerList.appendChild(card);

      }
    );

    const currentUsername =
      usernameInput.value.trim();

    if (data.host === currentUsername) {
      startBtn.classList.remove("hidden");
    } else {
      startBtn.classList.add("hidden");
    }

    if (data.started) {
      alert("Game Starting...");
    }

  });

}

readyBtn.addEventListener(
  "click",
  async () => {

    isReady = !isReady;

    const playerRef =
      ref(
        db,
        `lobbies/${currentRoom}/players/${currentPlayerId}`
      );

    await update(playerRef, {
      ready: isReady
    });

    readyBtn.textContent =
      isReady
        ? "Unready"
        : "Ready";

  }
);

startBtn.addEventListener(
  "click",
  async () => {

    const lobbyRef =
      ref(db, `lobbies/${currentRoom}`);

    await update(lobbyRef, {
      started: true
    });

  }
);

copyBtn.addEventListener(
  "click",
  async () => {

    await navigator.clipboard.writeText(
      currentRoom
    );

    copyBtn.textContent = "Copied";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1400);

  }
);

leaveBtn.addEventListener(
  "click",
  async () => {

    const playerRef =
      ref(
        db,
        `lobbies/${currentRoom}/players/${currentPlayerId}`
      );

    await remove(playerRef);

    location.reload();

  }
);

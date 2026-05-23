// =========================
// FIREBASE IMPORTS
// =========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =========================
// FIREBASE CONFIG
// =========================

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


// =========================
// INIT FIREBASE
// =========================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


// =========================
// ELEMENTS
// =========================

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


// =========================
// GENERATE ROOM CODE
// =========================

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


// =========================
// ERROR HANDLER
// =========================

function showError(message) {

  errorText.textContent = message;

  setTimeout(() => {
    errorText.textContent = "";
  }, 3000);

}


// =========================
// CREATE LOBBY
// =========================

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

    // Create lobby
    await set(lobbyRef, {
      createdAt: Date.now()
    });

    // Add creator
    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    await push(playersRef, {
      username
    });

    openLobby(roomCode);

  }
);


// =========================
// JOIN LOBBY
// =========================

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
      showError("Invalid room code");
      return;
    }

    // Add player
    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    await push(playersRef, {
      username
    });

    openLobby(roomCode);

  }
);


// =========================
// OPEN LOBBY
// =========================

function openLobby(roomCode) {

  homeScreen.classList.add("hidden");

  lobbyScreen.classList.remove("hidden");

  displayCode.textContent = roomCode;

  const playersRef =
    ref(db, `lobbies/${roomCode}/players`);

  // REALTIME PLAYER UPDATES
  onValue(playersRef, (snapshot) => {

    playerList.innerHTML = "";

    const data = snapshot.val();

    if (!data) return;

    const players =
      Object.values(data);

    playerCount.textContent =
      `${players.length} Players`;

    players.forEach((player) => {

      const div =
        document.createElement("div");

      div.className = "player";

      const firstLetter =
        player.username
          .charAt(0)
          .toUpperCase();

      div.innerHTML = `
        <div class="avatar">
          ${firstLetter}
        </div>

        <div class="player-name">
          ${player.username}
        </div>
      `;

      playerList.appendChild(div);

    });

  });

}


// =========================
// COPY ROOM CODE
// =========================

copyBtn.addEventListener(
  "click",
  async () => {

    const code =
      displayCode.textContent;

    await navigator.clipboard.writeText(code);

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);

  }
);

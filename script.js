// script.js

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

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_AUTH_DOMAIN",

  databaseURL: "YOUR_DATABASE_URL",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_STORAGE_BUCKET",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"

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
// ROOM CODE
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
// ERROR
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

    await set(lobbyRef, {
      createdAt: Date.now()
    });

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

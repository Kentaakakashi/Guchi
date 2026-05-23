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


// FIREBASE CONFIG

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


// INIT

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


// ELEMENTS

const usernameInput =
  document.getElementById("username");

const roomCodeInput =
  document.getElementById("roomCode");

const createBtn =
  document.getElementById("createBtn");

const joinBtn =
  document.getElementById("joinBtn");

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


// STATE

let currentRoom = "";
let currentPlayerId = "";
let isHost = false;


// ROOM CODE

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


// CREATE LOBBY

createBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value.trim();

    if (!username) {
      alert("Enter username");
      return;
    }

    const roomCode =
      generateRoomCode();

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    await set(lobbyRef, {
      host: username,
      started: false
    });

    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    const newPlayer =
      await push(playersRef, {
        username,
        ready: false
      });

    currentPlayerId = newPlayer.key;

    openLobby(roomCode);

  }
);


// JOIN LOBBY

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
      alert("Enter username");
      return;
    }

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    const snapshot =
      await get(lobbyRef);

    if (!snapshot.exists()) {
      alert("Invalid room");
      return;
    }

    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    const newPlayer =
      await push(playersRef, {
        username,
        ready: false
      });

    currentPlayerId = newPlayer.key;

    openLobby(roomCode);

  }
);


// OPEN LOBBY

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

        const div =
          document.createElement("div");

        div.className = "player";

        const isPlayerHost =
          player.username === data.host;

        if (
          player.username ===
          usernameInput.value.trim()
        ) {
          isHost = isPlayerHost;
        }

        div.innerHTML = `
          <div class="avatar">
            ${player.username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div class="player-name">
            ${player.username}
          </div>

          <div class="player-tags">

            ${
              isPlayerHost
                ? `
                <div class="tag host-tag">
                  HOST
                </div>
              `
                : ""
            }

            ${
              player.ready
                ? `
                <div class="tag ready-tag">
                  READY
                </div>
              `
                : ""
            }

          </div>
        `;

        playerList.appendChild(div);

      }
    );

    // HOST CONTROLS

    if (isHost) {
      startBtn.classList.remove("hidden");
    } else {
      startBtn.classList.add("hidden");
    }

    // GAME START

    if (data.started) {

      alert("Game Starting!");

    }

  });

}


// READY BUTTON

readyBtn.addEventListener(
  "click",
  async () => {

    const playerRef =
      ref(
        db,
        `lobbies/${currentRoom}/players/${currentPlayerId}`
      );

    await update(playerRef, {
      ready: true
    });

    readyBtn.textContent = "Ready ✓";

  }
);


// START BUTTON

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


// COPY BUTTON

copyBtn.addEventListener(
  "click",
  async () => {

    await navigator.clipboard.writeText(
      currentRoom
    );

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);

  }
);


// LEAVE BUTTON

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
        

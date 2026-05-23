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


// FIREBASE

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


// WORDS

const words = [
  "Pizza",
  "Hospital",
  "Banana",
"Toothbrush",
"Pillow",
"Umbrella",
"Keyboard",
"Mouse",
"Laptop",
"Phone",
"Headphones",
"Backpack",
"Water bottle",
"Mug",
"Spoon",
"Fork",
"Knife",
"Plate",
"Bowl",
"Pan",
"Fridge",
"Microwave",
"Fan",
"Air conditioner",
"Television",
"Remote",
"Couch",
"Bed",
"Blanket",
"Socks",
"Shoe",
"Slippers",
"Jacket",
"Hat",
"Sunglasses",
"Watch",
"Ring",
"Necklace",
"Comb",
"Mirror",
"Shampoo bottle",
"Soap",
"Towel",
"Toothpaste",
"Perfume",
"Lipstick",
"Charger",
"Extension cord",
"Battery",
"Flashlight",
"Camera",
"Tripod",
"Speaker",
"Guitar",
"Piano",
"Drum",
"Violin",
"Book",
"Notebook",
"Pen",
"Pencil",
"Eraser",
"Sharpener",
"Ruler",
"Scissors",
"Glue",
"Tape",
"Stapler",
"Calculator",
"Clock",
"Calendar",
"Globe",
"Map",
"Wallet",
"Coin",
"Key",
"Lock",
"Doorbell",
"Candle",
"Matchbox",
"Plant pot",
"Flower vase",
"Teddy bear",
"Dice",
"Chess board",
"Playing cards",
"Basketball",
"Football",
"Cricket bat",
"Helmet",
"Bicycle",
"Skateboard",
"Traffic cone",
"Shopping cart",
"Elevator",
"Escalator",
"Telescope",
"Binoculars",
"Thermometer",
"Syringe",
"Magnet"

];


// ELEMENTS

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

const gameScreen =
  document.getElementById("gameScreen");

const voteScreen =
  document.getElementById("voteScreen");

const resultScreen =
  document.getElementById("resultScreen");

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

const roleText =
  document.getElementById("roleText");

const wordText =
  document.getElementById("wordText");

const timerDisplay =
  document.getElementById("timerDisplay");

const voteBtn =
  document.getElementById("voteBtn");

const voteList =
  document.getElementById("voteList");

const voteStatus =
  document.getElementById("voteStatus");

const resultTitle =
  document.getElementById("resultTitle");

const resultText =
  document.getElementById("resultText");


// STATE

let currentRoom = "";
let currentPlayerId = "";
let currentUsername = "";
let isReady = false;


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


// ERROR

function showError(message) {

  errorText.textContent = message;

  setTimeout(() => {
    errorText.textContent = "";
  }, 3000);

}


// CREATE

createBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value.trim();

    if (!username) {
      showError("Enter username");
      return;
    }

    currentUsername = username;

    const roomCode =
      generateRoomCode();

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    await set(lobbyRef, {
      host: username,
      started: false,
      phase: "lobby"
    });

    const playersRef =
      ref(db, `lobbies/${roomCode}/players`);

    const playerRef = push(playersRef);

    currentPlayerId = playerRef.key;

    await set(playerRef, {
      username,
      ready: false,
      voted: false
    });

    openLobby(roomCode);

  }
);


// JOIN

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

    currentUsername = username;

    const lobbyRef =
      ref(db, `lobbies/${roomCode}`);

    const snapshot =
      await get(lobbyRef);

    if (!snapshot.exists()) {
      showError("Lobby not found");
      return;
    }

    const data = snapshot.val();

    const players = data.players || {};

    if (
      Object.keys(players).length >= 8
    ) {
      showError("Lobby full");
      return;
    }

    const playerRef = push(
      ref(db, `lobbies/${roomCode}/players`)
    );

    currentPlayerId = playerRef.key;

    await set(playerRef, {
      username,
      ready: false,
      voted: false
    });

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

    const players = data.players || {};

    playerList.innerHTML = "";

    playerCount.textContent =
      `${Object.keys(players).length}/8 Players`;

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
          ${player.username.charAt(0).toUpperCase()}
        </div>

        <div class="player-meta">

          <div class="player-name">
            ${player.username}
          </div>

          <div class="player-state">
            ${player.ready ? "Ready" : "Not ready"}
          </div>

        </div>

        <div class="badges">

          ${
            isHost
            ? `<div class="badge host">HOST</div>`
            : ""
          }

          ${
            player.ready
            ? `<div class="badge ready">READY</div>`
            : ""
          }

        </div>

        `;

        playerList.appendChild(card);

      }
    );


    // HOST BUTTON

    if (data.host === currentUsername) {
      startBtn.classList.remove("hidden");
    } else {
      startBtn.classList.add("hidden");
    }


    // GAME START

    if (data.phase === "game") {
      showGame(data);
    }


    // VOTING

    if (data.phase === "voting") {
      showVoting(data);
    }


    // RESULT

    if (data.phase === "result") {
      showResult(data);
    }

  });

}


// READY

readyBtn.addEventListener(
  "click",
  async () => {

    isReady = !isReady;

    await update(
      ref(
        db,
        `lobbies/${currentRoom}/players/${currentPlayerId}`
      ),
      {
        ready: isReady
      }
    );

    readyBtn.textContent =
      isReady ? "Unready" : "Ready";

  }
);


// START GAME

startBtn.addEventListener(
  "click",
  async () => {

    const snapshot =
      await get(
        ref(db, `lobbies/${currentRoom}`)
      );

    const data = snapshot.val();

    const players = data.players || {};

    const ids = Object.keys(players);

    const randomWord =
      words[
        Math.floor(Math.random() * words.length)
      ];

    const imposterId =
      ids[
        Math.floor(Math.random() * ids.length)
      ];


    // GIVE ROLES

    for (const id of ids) {

      const isImposter =
        id === imposterId;

      await update(
        ref(
          db,
          `lobbies/${currentRoom}/players/${id}`
        ),
        {
          role: isImposter
            ? "imposter"
            : "crewmate",

          word: isImposter
            ? null
            : randomWord
        }
      );

    }

    await update(
      ref(db, `lobbies/${currentRoom}`),
      {
        phase: "game",
        started: true
      }
    );

  }
);


// SHOW GAME

function showGame(data) {

  lobbyScreen.classList.add("hidden");

  voteScreen.classList.add("hidden");

  resultScreen.classList.add("hidden");

  gameScreen.classList.remove("hidden");


  const players = data.players || {};

  const me = players[currentPlayerId];

  if (!me) return;


  if (me.role === "imposter") {

    roleText.textContent =
      "IMPOSTER";

    wordText.textContent =
      "Blend in with the others";

  } else {

    roleText.textContent =
      "CREWMATE";

    wordText.textContent =
      `WORD: ${me.word}`;

  }


  // NO TIMER
  // Players manually go to voting whenever they want.

}


// MANUAL VOTE BUTTON

voteBtn.addEventListener(
  "click",
  async () => {

    await update(
      ref(db, `lobbies/${currentRoom}`),
      {
        phase: "voting"
      }
    );

  }
);


// SHOW VOTING

function showVoting(data) {

  gameScreen.classList.add("hidden");

  voteScreen.classList.remove("hidden");

  voteList.innerHTML = "";


  const players = data.players || {};


  Object.entries(players).forEach(
    ([id, player]) => {

      const card =
        document.createElement("div");

      card.className =
        "vote-card";

      card.innerHTML = `

      <div class="avatar">
        ${player.username.charAt(0).toUpperCase()}
      </div>

      <div class="player-meta">

        <div class="player-name">
          ${player.username}
        </div>

      </div>

      <button class="vote-btn">
        Vote
      </button>

      `;

      const btn =
        card.querySelector("button");

      btn.addEventListener(
        "click",
        async () => {

          await update(
            ref(
              db,
              `lobbies/${currentRoom}/votes/${id}`
            ),
            {
              count: (data.votes?.[id]?.count || 0) + 1,
              username: player.username
            }
          );

          await update(
            ref(
              db,
              `lobbies/${currentRoom}/players/${currentPlayerId}`
            ),
            {
              voted: true
            }
          );

          voteStatus.textContent =
            "Vote submitted";

          checkVotes();

        }
      );

      voteList.appendChild(card);

    }
  );

}


// CHECK VOTES

async function checkVotes() {

  const snapshot =
    await get(
      ref(db, `lobbies/${currentRoom}`)
    );

  const data = snapshot.val();

  const players = data.players || {};

  const votes = data.votes || {};

  const totalPlayers =
    Object.keys(players).length;

  const votedPlayers =
    Object.values(players)
      .filter(p => p.voted).length;

  if (votedPlayers < totalPlayers) return;


  let highest = 0;
  let eliminated = null;

  Object.entries(votes).forEach(
    ([id, vote]) => {

      if (vote.count > highest) {
        highest = vote.count;
        eliminated = id;
      }

    }
  );

  const eliminatedPlayer =
    players[eliminated];

  const imposter =
    Object.values(players)
      .find(p => p.role === "imposter");

  const imposterWon =
    eliminatedPlayer?.role !== "imposter";

  await update(
    ref(db, `lobbies/${currentRoom}`),
    {
      phase: "result",
      winner: imposterWon
        ? "Imposter"
        : "Crewmates",
      imposter: imposter.username
    }
  );

}


// RESULT

function showResult(data) {

  voteScreen.classList.add("hidden");

  gameScreen.classList.add("hidden");

  resultScreen.classList.remove("hidden");

  resultTitle.textContent =
    `${data.winner} Win`;

  resultText.innerHTML = `

  The imposter was:<br><br>

  <strong>
    ${data.imposter}
  </strong>

  `;

}


// COPY

copyBtn.addEventListener(
  "click",
  async () => {

    await navigator.clipboard.writeText(
      currentRoom
    );

    copyBtn.textContent = "Copied";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);

  }
);


// LEAVE

leaveBtn.addEventListener(
  "click",
  async () => {

    await remove(
      ref(
        db,
        `lobbies/${currentRoom}/players/${currentPlayerId}`
      )
    );

    location.reload();

  }
);

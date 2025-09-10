
// // Enums

// const LobbyStatus = Object.freeze({
//     LOBBY: 'lobby',
//     INGAME: 'ingame',
//     POSTGAME: 'postgame'
// });

// const GameTime = Object.freeze({
//     DAY: 'day',
//     NIGHT: 'night'
// })

// const StartTime = Object.freeze({
//     NIGHTKILL: 'nightkill',
//     NIGHTNOKILL: 'nightnokill',
//     DAY
// })

// // Classes

// class LobbyManager {
//   constructor() {
//     this.lobbies = new Map();
//     this.idTracker = 0;
//   }
// }

// class Setting {
//   constructor() {
//     this.dayLength = 6;
//     this.nightLength = 1;
//     this.playerCount = 5;
//     // Insert roles somehow
//     this.startTime = StartTime.DAY;
//     this.roleReveal = true;
//   }
// }

// class Lobby {
//   constructor(owner, id) {
//     this.owner = owner;
//     this.uid = id;
//     this.users = new Set();
//     this.lobbyStatus = LobbyStatus.LOBBY;
//     this.settings = new Setting();
//     this.gamestate = new GameState();
//   }
// }

// class GameState {
//   constructor() {
//     this.players = []
//     this.phases = [new Phase()];
//     this.settings = setting;
//     this.timer
//   }
// }

// class Player {
//   constructor(username, role) {
//     this.username = username;
//     this.alive = true;
//     this.role = role;
//   }
// }

// class Chat {
//   constructor() {
//     this.messages = []
//   }
// }

// class Phase {
//   constructor() {
//     this.gameTime = gameTime;
//     this.phaseId = phaseId;
//     this.chats = chats;
//   }
// }

// module.exports = {
//     LobbyStatus,
//     GameTime,
//     StartTime,
//     LobbyManager,
//     Setting,
//     Lobby,
//     GameState,
//     Player,
//     Chat,
//     Phase,
// }

const LobbyStatus = Object.freeze({
    PREGAME: 'pregame',
    INGAME: 'ingame',
    POSTGAME: 'postgame'
});

class Lobby {
  constructor(owner, title, lobbyId) {
    this.owner = owner;
    this.title = title;
    this.status = LobbyStatus.PREGAME;
    this.lobbyId = lobbyId;
    this.clients = new Set();
    this.chat = [];
  }
  getSockets() {
    return this.clients // array form of client list
  }
  messageSent(username, message) {
    this.chat.push({
      username,
      message
    })
  }
  getHistory() {
    return this.chat;
  }
}

module.exports = {
  Lobby
}
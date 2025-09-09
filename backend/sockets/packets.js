
// Client to server packets (C2S)
class SendMessage {
  constructor(user, message, time = Date.now()) {
    this.type = "sendMessage";
    this.user = user;
    this.message = message;
    this.time = time;
  }
}

class SendVote {
  constructor(user, target, time = Date.now()) {
    this.type = "sendVote";
    this.user = user;
    this.target = target;
    this.time = time;
  }
}

class StartGame {
  constructor(user) {
    this.type = "startGame";
    this.user = user;
  }
}

class ReadyChange {
  constructor(user, ready) {
    this.type = "readyChange";
    this.user = user;
    this.ready = ready;
  }
}

class Handshake {
  constructor(accessToken, lobbyId) {
    this.type = "handshake";
    this.accessToken = accessToken;
    this.lobbyId = lobbyId;
  }
}

// Server to client packets (S2C)
class NewMessage {
  constructor(user, message, time = Date.now()) {
    this.type = "newMessage";
    this.user = user;
    this.message = message;
    this.time = time;
  }
}

class NewVote {
  constructor(user, target, time = Date.now()) {
    this.type = "newVote";
    this.user = user;
    this.target = target;
    this.time = time;
  }
}

class GameStart {
  constructor(gamestate) { // gamestate is a gamestate class
    this.type = "gameStart";
    this.gamestate = gamestate;
  }
}

class TimeUpdate {
  constructor(time) {
    this.type = "timeUpdate"
    this.time = time;
  }
}

class PhaseUpdate {
  constructor(phase, players) {
    this.type = "phaseUpdate";
    this.phase = phase;
    this.players = players;
  }
}

class GameEnd {
  constructor(gamestate, victory) {
    this.type = "gameEnd";
    this.gamestate = gamestate;
    this.victory = victory;
  }
}

module.exports = {
  SendMessage,
  SendVote,
  StartGame,
  ReadyChange,
  NewMessage,
  NewVote,
  GameStart,
  TimeUpdate,
  PhaseUpdate,
  GameEnd,
  Handshake,
};
